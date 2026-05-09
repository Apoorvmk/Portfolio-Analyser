import pandas as pd
import numpy as np
from models.schemas import AnalysisRequest, AnalysisReport
from services.metrics import (
    calculate_entropy, 
    calculate_hhi, 
    calculate_coverage, 
    calculate_concentration_ratio, 
    get_diversification_score
)
from services.gap_analysis import analyze_gaps

def run_analysis_pipeline(request: AnalysisRequest, mf_data: pd.DataFrame) -> AnalysisReport:
    """
    Orchestrates the full analysis pipeline.
    """
    # 1. Aggregate investments by sector
    stocks_data = [s.dict() for s in request.portfolio.stocks]
    if not stocks_data:
        # Return empty report structure if no stocks
        return AnalysisReport(
            sector_allocation={},
            entropy=0.0,
            hhi=1.0,
            coverage=0,
            concentration_ratio=0.0,
            gap_analysis={},
            severity_flags={},
            missing_sectors=[],
            over_exposed_sectors=[],
            diversification_score=0.0,
            selected_fund_name=request.selected_fund
        )

    df_user = pd.DataFrame(stocks_data)
    sector_sums = df_user.groupby('sector')['amount_invested'].sum()
    total_invested = sector_sums.sum()
    
    if total_invested == 0:
        total_invested = 1.0 # Avoid division by zero
        
    # 2. Normalize to percentages (0-100)
    user_allocation = (sector_sums / total_invested * 100).to_dict()
    
    # 3. Calculate metrics using probability vector (sum to 1)
    probs = (sector_sums / total_invested).values
    entropy = calculate_entropy(probs)
    hhi = calculate_hhi(probs)
    coverage = calculate_coverage(probs)
    concentration_ratio = calculate_concentration_ratio(probs)
    
    # 4. Load selected MF vector from CSV
    fund_row = mf_data[mf_data['fund_name'] == request.selected_fund]
    if fund_row.empty:
        # Fallback if fund not found, though should be handled by validation
        fund_alloc_dict = {}
    else:
        # Sector columns are everything except fund_name
        fund_alloc_dict = fund_row.iloc[0].drop('fund_name').to_dict()
        fund_alloc_dict = {k: float(v) for k, v in fund_alloc_dict.items()}
    
    # 5. Run gap analysis
    gap_vals, severity, missing, over_exposed = analyze_gaps(user_allocation, fund_alloc_dict)
    
    # 6. Calculate diversification score
    # Use the number of sectors defined in the mutual fund dataset as the baseline
    n_baseline_sectors = len(mf_data.columns) - 1
    score = get_diversification_score(entropy, hhi, n_baseline_sectors)
    
    return AnalysisReport(
        sector_allocation={k: round(v, 2) for k, v in user_allocation.items()},
        entropy=round(float(entropy), 4),
        hhi=round(float(hhi), 4),
        coverage=coverage,
        concentration_ratio=round(float(concentration_ratio * 100), 2),
        gap_analysis=gap_vals,
        severity_flags=severity,
        missing_sectors=missing,
        over_exposed_sectors=over_exposed,
        diversification_score=score,
        selected_fund_name=request.selected_fund
    )
