# ================================================
# Cosine Similarity Matching
# ================================================
# Compares user's sector vector against all 31 MF
# benchmark vectors and returns ranked matches.
# ================================================

import pandas as pd
import numpy as np


# -----------------------------------------------
# 1. LOAD BENCHMARK VECTORS
# -----------------------------------------------
def load_benchmark_vectors(vectors_csv="fund_sector_vectors.csv",
                            metrics_csv="fund_metrics.csv"):
    """
    Load MF sector vectors and their category labels.
    Returns aligned DataFrame with category column.
    """
    vectors = pd.read_csv(vectors_csv, index_col="fund_name")
    metrics = pd.read_csv(metrics_csv, index_col="fund_name")[["category"]]
    benchmark = vectors.join(metrics)
    return benchmark


# -----------------------------------------------
# 2. ALIGN USER VECTOR WITH BENCHMARK SECTORS
# -----------------------------------------------
def align_vectors(user_sector_vector, benchmark):
    """
    Align user's sector dict with benchmark sector columns.
    Missing sectors in user portfolio are filled with 0.
    Returns user vector as numpy array aligned to benchmark columns.
    """
    sector_cols = [c for c in benchmark.columns if c != "category"]
    user_array = np.array([user_sector_vector.get(s, 0.0) for s in sector_cols])
    return user_array, sector_cols


# -----------------------------------------------
# 3. COSINE SIMILARITY
# -----------------------------------------------
def cosine_similarity(vec_a, vec_b):
    """Cosine similarity between two vectors."""
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))


# -----------------------------------------------
# 4. MATCH USER PORTFOLIO AGAINST ALL BENCHMARKS
# -----------------------------------------------
def match_portfolio(user_sector_vector, benchmark):
    """
    Compare user portfolio against all benchmark MFs.
    Returns a ranked DataFrame of similarity scores.
    """
    user_array, sector_cols = align_vectors(user_sector_vector, benchmark)

    results = []
    for fund_name, row in benchmark.iterrows():
        bench_array = row[sector_cols].values.astype(float)
        similarity = cosine_similarity(user_array, bench_array)
        results.append({
            "fund_name":  fund_name,
            "category":   row["category"],
            "similarity": round(similarity, 4)
        })

    results_df = (pd.DataFrame(results)
                    .sort_values("similarity", ascending=False)
                    .reset_index(drop=True))
    return results_df


# -----------------------------------------------
# 5. GET TOP MATCH + CATEGORY CLASSIFICATION
# -----------------------------------------------
def get_classification(results_df, top_n=5):
    """
    Returns:
    - top match (most similar fund)
    - top N matches
    - category classification
    """
    # Filter out debt/commodity — not meaningful equity comparisons
    exclude_categories = ["Debt", "Commodity"]
    equity_results = results_df[~results_df["category"].isin(exclude_categories)]

    top_match = equity_results.iloc[0]
    top_n_matches = equity_results.head(top_n)

    return {
        "top_match_fund":       top_match["fund_name"],
        "top_match_category":   top_match["category"],
        "top_match_similarity": top_match["similarity"],
        "top_n":                top_n_matches
    }


# -----------------------------------------------
# 6. SECTOR GAP ANALYSIS
# -----------------------------------------------
def sector_gap_analysis(user_sector_vector, benchmark, top_match_fund):
    """
    Compare user portfolio sector by sector against the top matched fund.
    Identifies overexposed and underexposed sectors.
    """
    sector_cols = [c for c in benchmark.columns if c != "category"]
    bench_vector = benchmark.loc[top_match_fund, sector_cols].to_dict()

    gaps = []
    all_sectors = set(user_sector_vector.keys()) | set(k for k, v in bench_vector.items() if v > 0)

    for sector in all_sectors:
        user_pct = user_sector_vector.get(sector, 0.0)
        bench_pct = bench_vector.get(sector, 0.0)
        diff = round(user_pct - bench_pct, 3)
        gaps.append({
            "sector":     sector,
            "user_pct":   round(user_pct, 3),
            "bench_pct":  round(bench_pct, 3),
            "difference": diff,
            "status":     "Overexposed" if diff > 2 else ("Underexposed" if diff < -2 else "Aligned")
        })

    return (pd.DataFrame(gaps)
              .sort_values("difference", ascending=False)
              .reset_index(drop=True))


# -----------------------------------------------
# 7. MAIN — DEMO
# -----------------------------------------------
if __name__ == "__main__":
    from user_portfolio_pipeline import load_sector_mapping, process_user_portfolio, compute_metrics

    # Sample user portfolio
    user_stocks = [
        {"stock": "HDFC Bank Limited",           "amount": 50000},
        {"stock": "Infosys Limited",             "amount": 40000},
        {"stock": "Reliance Industries Limited", "amount": 30000},
        {"stock": "ICICI Bank Limited",          "amount": 20000},
        {"stock": "Larsen & Toubro Limited",     "amount": 15000},
    ]

    # Step 1 — User sector vector
    mapping, mapping_upper = load_sector_mapping("fund_stocks_clean.csv")
    sector_vector, unmatched = process_user_portfolio(user_stocks, mapping, mapping_upper)
    metrics = compute_metrics(sector_vector)

    print("User Sector Vector:")
    for s, p in sorted(sector_vector.items(), key=lambda x: -x[1]):
        print(f"  {s:<35} {p:.3f}%")

    print("\nUser Metrics:")
    for k, v in metrics.items():
        print(f"  {k:<20} {v}")

    # Step 2 — Load benchmarks
    benchmark = load_benchmark_vectors("fund_sector_vectors.csv", "fund_metrics.csv")

    # Step 3 — Match
    results_df = match_portfolio(sector_vector, benchmark)

    # Step 4 — Classification
    classification = get_classification(results_df)

    print(f"\nTop Match:  {classification['top_match_fund']}")
    print(f"Category:   {classification['top_match_category']}")
    print(f"Similarity: {classification['top_match_similarity']}")

    print(f"\nTop 5 Similar Funds:")
    print(classification["top_n"].to_string(index=False))

    # Step 5 — Gap analysis
    gaps = sector_gap_analysis(sector_vector, benchmark, classification["top_match_fund"])

    print(f"\nSector Gap Analysis vs {classification['top_match_fund']}:")
    print("-" * 65)
    print(gaps.to_string(index=False))