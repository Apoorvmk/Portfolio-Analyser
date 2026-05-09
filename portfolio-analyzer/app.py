# ================================================
# Portfolio Diversification Analyzer — Streamlit UI
# ================================================
# Run with: streamlit run app.py
# Make sure these files are in the same folder:
#   - fund_stocks_clean.csv
#   - fund_sector_vectors.csv
#   - fund_metrics.csv
# ================================================

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

from user_portfolio_pipeline import load_sector_mapping, process_user_portfolio, compute_metrics
from cosine_similarity import load_benchmark_vectors, match_portfolio, get_classification, sector_gap_analysis

# -----------------------------------------------
# PAGE CONFIG
# -----------------------------------------------
st.set_page_config(
    page_title="Portfolio Diversification Analyzer",
    page_icon="📊",
    layout="wide"
)

# -----------------------------------------------
# LOAD DATA (cached so it only runs once)
# -----------------------------------------------
@st.cache_data
def load_data():
    mapping, mapping_upper = load_sector_mapping("fund_stocks_clean.csv")
    benchmark = load_benchmark_vectors("fund_sector_vectors.csv", "fund_metrics.csv")
    stock_list = sorted(mapping.keys())
    return mapping, mapping_upper, benchmark, stock_list

mapping, mapping_upper, benchmark, stock_list = load_data()

# -----------------------------------------------
# HEADER
# -----------------------------------------------
st.markdown("""
<div style="background-color: #0f1117; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; border: 1px solid #1E293B;">
    <h1 style="color: white; margin-bottom: 0.5rem; font-size: 2.5rem;">Portfolio Diversification Analyzer</h1>
    <p style="color: #94a3b8; font-size: 1.1rem; margin-bottom: 1rem;">Understand the structure of your investments. Compare with real mutual funds.</p>
    <span style="background-color: #1E293B; color: #38bdf8; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: bold;">Powered by Groww MF Benchmark Data</span>
</div>
""", unsafe_allow_html=True)

# -----------------------------------------------
# SECTION 1 — USER INPUT
# -----------------------------------------------
st.markdown("<h3 style='border-left: 5px solid #3B82F6; padding-left: 10px;'>Step 1 — Enter Your Portfolio</h3>", unsafe_allow_html=True)

st.markdown("<div style='background-color: #1E293B; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;'>", unsafe_allow_html=True)
num_stocks = st.slider("How many stocks do you want to add?", min_value=2, max_value=20, value=5)
st.markdown("<br>", unsafe_allow_html=True)

current_total = sum(st.session_state.get(f"amount_{i}", 0.0) for i in range(num_stocks))

user_stocks = []
col1, col2, col3 = st.columns([3, 2, 1])
col1.markdown("**Stock Name**")
col2.markdown("**Amount Invested (₹)**")
col3.markdown("**% of Total**")

for i in range(num_stocks):
    col1, col2, col3 = st.columns([3, 2, 1])
    with col1:
        stock = st.selectbox(
            f"Stock {i+1}",
            options=[""] + stock_list,
            key=f"stock_{i}",
            label_visibility="collapsed",
            placeholder="Select a stock..."
        )
    with col2:
        amount = st.number_input(
            f"Amount {i+1}",
            min_value=0.0,
            value=0.0,
            key=f"amount_{i}",
            label_visibility="collapsed"
        )
    with col3:
        if current_total > 0 and amount > 0:
            pct = (amount / current_total) * 100
            st.markdown(f"<div style='padding-top: 0.5rem; color: #94a3b8;'>{pct:.1f}%</div>", unsafe_allow_html=True)
        else:
            st.markdown("<div style='padding-top: 0.5rem; color: #94a3b8;'>–</div>", unsafe_allow_html=True)
            
    if stock and amount > 0:
        user_stocks.append({"stock": stock, "amount": amount})

st.markdown("<br>", unsafe_allow_html=True)
st.markdown(f"<h4 style='color: #22C55E;'>Total Portfolio Value: ₹{current_total:,.0f}</h4>", unsafe_allow_html=True)
st.markdown("</div>", unsafe_allow_html=True)

st.divider()

# -----------------------------------------------
# ANALYZE BUTTON
# -----------------------------------------------
analyze = st.button("🔍 Analyze Portfolio", type="primary", use_container_width=True)

if analyze:
    if len(user_stocks) < 2:
        st.warning("Please enter at least 2 stocks with amounts to analyze.")
    else:
        with st.spinner("Analyzing your portfolio..."):
            # -----------------------------------------------
            # PROCESS PORTFOLIO
            # -----------------------------------------------
            sector_vector, unmatched = process_user_portfolio(user_stocks, mapping, mapping_upper)
            
            if unmatched:
                st.info(f"Note: {len(unmatched)} stock(s) could not be mapped and were skipped: {', '.join(unmatched)}")
                
            metrics = compute_metrics(sector_vector)

            # -----------------------------------------------
            # SECTION 2 — SECTOR ALLOCATION
            # -----------------------------------------------
            st.markdown("<h3 style='border-left: 5px solid #3B82F6; padding-left: 10px; margin-top: 2rem;'>📂 Sector Allocation</h3>", unsafe_allow_html=True)
            st.markdown("<div style='background-color: #1E293B; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;'>", unsafe_allow_html=True)

            sector_df = pd.DataFrame({
                "Sector": list(sector_vector.keys()),
                "Weight (%)": list(sector_vector.values())
            }).sort_values("Weight (%)", ascending=False)
            sector_df = sector_df[sector_df["Weight (%)"] > 0]

            col1, col2 = st.columns([1, 1])
            with col1:
                fig_tree = px.treemap(
                    sector_df,
                    path=[px.Constant("Portfolio"), "Sector"],
                    values="Weight (%)",
                    color="Weight (%)",
                    color_continuous_scale="Blues"
                )
                fig_tree.update_traces(textinfo="label+percent entry")
                fig_tree.update_layout(
                    margin=dict(t=10, b=10, l=10, r=10),
                    plot_bgcolor="rgba(0,0,0,0)",
                    paper_bgcolor="rgba(0,0,0,0)",
                    coloraxis_showscale=False
                )
                st.plotly_chart(fig_tree, use_container_width=True)

            with col2:
                fig_bar = px.bar(
                    sector_df, x="Weight (%)", y="Sector",
                    orientation="h",
                    text="Weight (%)"
                )
                fig_bar.update_traces(
                    texttemplate="%{text:.1f}%", 
                    textposition="outside",
                    marker_color="#3B82F6"
                )
                fig_bar.update_layout(
                    yaxis=dict(autorange="reversed", title=""),
                    xaxis=dict(title=""),
                    plot_bgcolor="rgba(0,0,0,0)",
                    paper_bgcolor="rgba(0,0,0,0)",
                    margin=dict(t=10, b=10, l=10, r=10)
                )
                st.plotly_chart(fig_bar, use_container_width=True)
                
            st.markdown("</div>", unsafe_allow_html=True)

            # -----------------------------------------------
            # SECTION 3 — DIVERSIFICATION METRICS
            # -----------------------------------------------
            st.markdown("<h3 style='border-left: 5px solid #22C55E; padding-left: 10px; margin-top: 2rem;'>📏 Diversification Metrics</h3>", unsafe_allow_html=True)
            st.markdown("<div style='background-color: #1E293B; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;'>", unsafe_allow_html=True)

            m1, m2, m3, m4 = st.columns(4)
            
            div_score = metrics['div_score']
            if div_score >= 70:
                score_color = "#22C55E"
                score_label = "Well Diversified"
            elif div_score >= 40:
                score_color = "#F97316"
                score_label = "Moderately Diversified"
            else:
                score_color = "#EF4444"
                score_label = "Highly Concentrated"
                
            with m1:
                st.markdown(f"**Diversification Score**")
                st.markdown(f"<h2 style='color: {score_color}; margin: 0;'>{div_score:.1f} / 100</h2>", unsafe_allow_html=True)
                st.caption(score_label)
                
            with m2:
                st.markdown(f"**Entropy**")
                st.markdown(f"<h2 style='margin: 0;'>{metrics['entropy']:.3f}</h2>", unsafe_allow_html=True)
                total_sectors = len(set(mapping_upper.values()))
                max_entropy = np.log(total_sectors) if total_sectors > 1 else 1.0
                norm_entropy = min(1.0, max(0.0, metrics['entropy'] / max_entropy))
                st.progress(norm_entropy)
                st.caption("Higher = more evenly spread")
                
            with m3:
                st.markdown(f"**HHI (Concentration)**")
                st.markdown(f"<h2 style='margin: 0;'>{metrics['hhi']:.3f}</h2>", unsafe_allow_html=True)
                st.progress(max(0.0, 1.0 - metrics['hhi']))
                st.caption("Lower = less concentrated")
                
            with m4:
                st.markdown(f"**Sector Coverage**")
                st.markdown(f"<h2 style='margin: 0;'>{metrics['sector_coverage']}</h2>", unsafe_allow_html=True)
                st.caption(f"out of {total_sectors} sectors")

            st.markdown("</div>", unsafe_allow_html=True)

            # -----------------------------------------------
            # SECTION 4 — BENCHMARK MATCHING
            # -----------------------------------------------
            st.markdown("<h3 style='border-left: 5px solid #F97316; padding-left: 10px; margin-top: 2rem;'>🔗 Mutual Fund Comparison</h3>", unsafe_allow_html=True)
            st.markdown("<div style='background-color: #1E293B; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;'>", unsafe_allow_html=True)

            results_df = match_portfolio(sector_vector, benchmark)
            classification = get_classification(results_df, top_n=5)
            
            sim_score = classification['top_match_similarity'] * 100
            cat_colors = {"Index": "#3B82F6", "Large Cap": "#22C55E", "Hybrid": "#F97316", "Flexi Cap": "#8B5CF6", "Mid Cap": "#EAB308", "Small Cap": "#EF4444"}
            cat_color = cat_colors.get(classification['top_match_category'], "#3B82F6")

            st.markdown(f"""
            <div style="background-color: #0f1117; padding: 1.5rem; border-radius: 10px; border: 1px solid #334155; margin-bottom: 2rem;">
                <p style="color: #94a3b8; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: bold; letter-spacing: 1px;">BEST MATCH</p>
                <h2 style="color: white; margin-top: 0; margin-bottom: 0.5rem;">{classification['top_match_fund']}</h2>
                <span style="background-color: {cat_color}33; color: {cat_color}; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.9rem; font-weight: bold; margin-bottom: 1rem; display: inline-block;">{classification['top_match_category']}</span>
                
                <div style="margin-top: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #94a3b8;">Cosine Similarity Score</span>
                        <span style="color: white; font-weight: bold;">{sim_score:.1f}%</span>
                    </div>
                    <div style="width: 100%; background-color: #334155; border-radius: 5px; height: 10px;">
                        <div style="width: {sim_score}%; background-color: #3B82F6; height: 10px; border-radius: 5px;"></div>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)

            st.markdown("**Top 5 Similar Funds**")
            top5 = classification["top_n"].copy()
            
            table_html = "<table style='width: 100%; border-collapse: collapse;'>"
            table_html += "<tr style='border-bottom: 1px solid #334155; text-align: left; color: #94a3b8;'><th style='padding: 10px;'>Rank</th><th style='padding: 10px;'>Fund Name</th><th style='padding: 10px;'>Category</th><th style='padding: 10px;'>Similarity</th></tr>"
            
            for i, row in top5.iterrows():
                bg_color = "#0f1117" if i == 0 else ("#1E293B" if i%2==0 else "#0f1117")
                row_sim = row['similarity'] * 100
                rcat_color = cat_colors.get(row['category'], "#3B82F6")
                
                table_html += f"<tr style='background-color: {bg_color}; border-bottom: 1px solid #334155;'>"
                table_html += f"<td style='padding: 10px; font-weight: bold; color: {'#3B82F6' if i==0 else 'white'};'>#{i+1}</td>"
                table_html += f"<td style='padding: 10px;'>{row['fund_name']}</td>"
                table_html += f"<td style='padding: 10px;'><span style='background-color: {rcat_color}33; color: {rcat_color}; padding: 0.2rem 0.6rem; border-radius: 10px; font-size: 0.8rem;'>{row['category']}</span></td>"
                table_html += f"<td style='padding: 10px;'><div style='display: flex; align-items: center;'><span style='min-width: 45px;'>{row_sim:.1f}%</span> <div style='width: 100px; background-color: #334155; border-radius: 3px; height: 6px; margin-left: 10px;'><div style='width: {row_sim}%; background-color: #3B82F6; height: 6px; border-radius: 3px;'></div></div></div></td>"
                table_html += "</tr>"
            table_html += "</table>"
            
            st.markdown(table_html, unsafe_allow_html=True)
            st.markdown("</div>", unsafe_allow_html=True)

            # -----------------------------------------------
            # SECTION 5 — GAP ANALYSIS
            # -----------------------------------------------
            st.markdown("<h3 style='border-left: 5px solid #EF4444; padding-left: 10px; margin-top: 2rem;'>🔎 Where Does Your Portfolio Differ?</h3>", unsafe_allow_html=True)
            st.markdown("<div style='background-color: #1E293B; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;'>", unsafe_allow_html=True)

            gaps = sector_gap_analysis(sector_vector, benchmark, classification["top_match_fund"])

            st.markdown("""
            <div style="display: flex; gap: 20px; margin-bottom: 1rem;">
                <div><span style="color: #EF4444;">🔴</span> <b>Overexposed</b> <span style="color: #94a3b8; font-size: 0.9rem;">(you have more than the benchmark)</span></div>
                <div><span style="color: #3B82F6;">🔵</span> <b>Underexposed</b> <span style="color: #94a3b8; font-size: 0.9rem;">(you have less)</span></div>
                <div><span style="color: #22C55E;">✅</span> <b>Aligned</b> <span style="color: #94a3b8; font-size: 0.9rem;">(within ±2%)</span></div>
            </div>
            """, unsafe_allow_html=True)

            gaps_display = gaps[gaps["status"] != "Aligned"].copy()
            gaps_display = gaps_display[gaps_display["difference"].abs() > 1.0]
            
            if not gaps_display.empty:
                gaps_display["abs_diff"] = gaps_display["difference"].abs()
                gaps_display = gaps_display.sort_values("abs_diff", ascending=True)
                
                fig_gap = px.bar(
                    gaps_display,
                    x="difference", y="sector",
                    orientation="h",
                    color="status",
                    color_discrete_map={
                        "Overexposed": "#EF4444",
                        "Underexposed": "#3B82F6"
                    },
                    text="difference"
                )
                fig_gap.update_traces(texttemplate="%{text:+.1f}%", textposition="outside")
                fig_gap.update_layout(
                    plot_bgcolor="rgba(0,0,0,0)",
                    paper_bgcolor="rgba(0,0,0,0)",
                    margin=dict(t=20, b=20, l=10, r=10),
                    showlegend=False,
                    xaxis=dict(title="", zeroline=True, zerolinecolor="white", zerolinewidth=1),
                    yaxis=dict(title="")
                )
                fig_gap.add_vline(x=0, line_width=1, line_color="white")
                st.plotly_chart(fig_gap, use_container_width=True)
                
                st.markdown("<br>", unsafe_allow_html=True)
                c1, c2 = st.columns(2)
                
                with c1:
                    st.markdown("**You're Heavy In**")
                    over = gaps_display[gaps_display["status"] == "Overexposed"].sort_values("difference", ascending=False)
                    for _, row in over.iterrows():
                        st.markdown(f"<div style='background-color: #EF444433; color: #fca5a5; padding: 0.4rem 0.8rem; border-radius: 5px; margin-bottom: 0.5rem; display: flex; justify-content: space-between;'><span>{row['sector']}</span> <b>+{row['difference']:.1f}%</b></div>", unsafe_allow_html=True)
                
                with c2:
                    st.markdown("**You're Missing**")
                    under = gaps_display[gaps_display["status"] == "Underexposed"].sort_values("difference", ascending=True)
                    for _, row in under.iterrows():
                        st.markdown(f"<div style='background-color: #3B82F633; color: #93c5fd; padding: 0.4rem 0.8rem; border-radius: 5px; margin-bottom: 0.5rem; display: flex; justify-content: space-between;'><span>{row['sector']}</span> <b>{row['difference']:.1f}%</b></div>", unsafe_allow_html=True)

            st.markdown("</div>", unsafe_allow_html=True)

            # -----------------------------------------------
            # SECTION 6 — PORTFOLIO SUMMARY
            # -----------------------------------------------
            st.markdown("<h3 style='border-left: 5px solid #8B5CF6; padding-left: 10px; margin-top: 2rem;'>📝 Portfolio Summary</h3>", unsafe_allow_html=True)
            
            top_underexposed = gaps[(gaps["status"] == "Underexposed") & (gaps["difference"].abs() > 1.0)]
            if not top_underexposed.empty:
                missing_sectors = ", ".join(top_underexposed.sort_values("difference")["sector"].head(2).tolist())
            else:
                missing_sectors = "none of the major sectors"
            
            max_sector = metrics['max_sector']
            max_diff_series = gaps[gaps['sector'] == max_sector]['difference'].values
            max_diff = max_diff_series[0] if len(max_diff_series) > 0 else 0.0

            summary_text = f"Your portfolio of {len(user_stocks)} stocks spans {metrics['sector_coverage']} sectors with a diversification score of {div_score:.1f}/100. It is most structurally similar to {classification['top_match_fund']} ({classification['top_match_category']}), with a cosine similarity of {sim_score:.1f}%. Your dominant sector is {max_sector} at {metrics['max_weight']:.1f}%, which is {abs(max_diff):.1f}% higher than the benchmark. You are underexposed in {missing_sectors}."
            
            st.markdown(f"""
            <div style="background-color: #1E293B; padding: 1.5rem; border-radius: 10px; border-left: 4px solid #8B5CF6; margin-bottom: 1rem;">
                <p style="color: white; font-size: 1.1rem; line-height: 1.6; margin: 0;">{summary_text}</p>
            </div>
            """, unsafe_allow_html=True)
            
            report_content = f"""PORTFOLIO DIVERSIFICATION REPORT
--------------------------------
Total Value: Rs. {current_total:,.0f}
Number of Stocks: {len(user_stocks)}
Diversification Score: {div_score:.1f}/100
Entropy: {metrics['entropy']:.3f}
HHI: {metrics['hhi']:.3f}

BEST MUTUAL FUND MATCH
--------------------------------
Fund: {classification['top_match_fund']}
Category: {classification['top_match_category']}
Similarity: {sim_score:.1f}%

SUMMARY
--------------------------------
{summary_text}
"""
            st.download_button("📥 Download Report", data=report_content, file_name="portfolio_report.txt", mime="text/plain")