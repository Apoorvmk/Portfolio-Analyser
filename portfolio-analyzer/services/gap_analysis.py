from typing import Dict, List, Tuple

def analyze_gaps(user_alloc: Dict[str, float], fund_alloc: Dict[str, float]) -> Tuple[Dict[str, float], Dict[str, str], List[str], List[str]]:
    """
    Analyzes gaps between user portfolio and mutual fund benchmark.
    Returns: (gap_values, severity_flags, missing_sectors, over_exposed_sectors)
    """
    gap_analysis = {}
    severity_flags = {}
    missing_sectors = []
    over_exposed_sectors = []
    
    # Ensure we cover all sectors from both vectors
    all_sectors = set(user_alloc.keys()).union(set(fund_alloc.keys()))
    
    for sector in all_sectors:
        u_val = user_alloc.get(sector, 0.0)
        f_val = fund_alloc.get(sector, 0.0)
        
        gap = u_val - f_val
        gap_analysis[sector] = round(gap, 2)
        
        # Severity Classification:
        # abs(gap) < 5% -> "minor"
        # abs(gap) 5-15% -> "notable"
        # abs(gap) > 15% -> "significant"
        abs_gap = abs(gap)
        if abs_gap < 5:
            severity_flags[sector] = "minor"
        elif abs_gap <= 15:
            severity_flags[sector] = "notable"
        else:
            severity_flags[sector] = "significant"
            
        # Flag missing sectors (user has 0, MF has > 0)
        if u_val == 0 and f_val > 0:
            missing_sectors.append(sector)
            
        # Flag over-exposed sectors (user is 2x or more vs selected fund)
        if f_val > 0 and u_val >= 2 * f_val:
            over_exposed_sectors.append(sector)
        elif f_val == 0 and u_val > 10: # Special case: benchmark is 0, user is > 10%
            over_exposed_sectors.append(sector)
            
    return gap_analysis, severity_flags, missing_sectors, over_exposed_sectors
