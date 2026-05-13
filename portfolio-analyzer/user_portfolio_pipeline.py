# ================================================
# User Portfolio Pipeline
# ================================================
# Takes user's stocks + investment amounts
# Maps to sectors using Groww benchmark data
# Generates sector allocation vector
# Computes HHI, entropy, diversification score
# ================================================

import pandas as pd
import numpy as np

# -----------------------------------------------
# 1. LOAD STOCK → SECTOR MAPPING
# -----------------------------------------------
def load_sector_mapping(clean_csv_path="data/fund_stocks_clean_grouped.csv"):
    """
    Build stock -> sector dictionary from Groww benchmark data.
    Filters out debt/sovereign instruments.
    """
    debt_sectors = [
        'SOVEREIGN', 'CRISIL AAA', 'CRISIL A1+', 'CARE AAA',
        'CARE A1+', 'ICRA AAA', 'ICRA A1+', 'OTHERS'
    ]
    df = pd.read_csv(clean_csv_path)
    equity = df[~df['sector'].isin(debt_sectors)]
    
    # If a stock appears in multiple funds with same sector, keep first occurrence
    mapping = (
        equity.drop_duplicates(subset='stock')
              .set_index('stock')['sector']
              .to_dict()
    )
    
    # Also create uppercase version for case-insensitive matching
    mapping_upper = {k.upper(): v for k, v in mapping.items()}
    return mapping, mapping_upper


# -----------------------------------------------
# 2. PROCESS USER PORTFOLIO
# -----------------------------------------------
def process_user_portfolio(user_stocks, mapping, mapping_upper):
    """
    user_stocks: list of dicts [{'stock': 'Infosys Limited', 'amount': 50000}, ...]
    Returns: sector_vector (dict), unmatched stocks (list)
    """
    sector_amounts = {}
    unmatched = []

    for entry in user_stocks:
        stock = entry['stock'].strip()
        amount = entry['amount']

        # Try exact match first, then uppercase match
        sector = mapping.get(stock) or mapping_upper.get(stock.upper())

        if sector:
            sector_amounts[sector] = sector_amounts.get(sector, 0) + amount
        else:
            unmatched.append(stock)

    if not sector_amounts:
        return None, unmatched

    # Normalize to percentages
    total = sum(sector_amounts.values())
    sector_vector = {s: round((a / total) * 100, 3) for s, a in sector_amounts.items()}

    return sector_vector, unmatched


# -----------------------------------------------
# 3. COMPUTE DIVERSIFICATION METRICS
# -----------------------------------------------
def compute_metrics(sector_vector):
    """
    Compute entropy, HHI, diversification score, coverage
    from a sector allocation dict.
    """
    weights = np.array(list(sector_vector.values())) / 100

    # Normalized entropy
    weights_nonzero = weights[weights > 0]
    H = -np.sum(weights_nonzero * np.log(weights_nonzero + 1e-10))
    H_max = np.log(len(weights_nonzero))
    entropy = H / H_max if H_max != 0 else 0

    # HHI
    hhi = np.sum(weights ** 2)

    # Diversification score
    div_score = ((entropy + (1 - hhi)) / 2) * 100

    # Coverage
    coverage = len(weights_nonzero)

    # Max sector
    max_sector = max(sector_vector, key=sector_vector.get)
    max_weight = sector_vector[max_sector]

    return {
        'entropy':         round(entropy, 4),
        'hhi':             round(hhi, 4),
        'div_score':       round(div_score, 2),
        'sector_coverage': coverage,
        'max_sector':      max_sector,
        'max_weight':      round(max_weight, 3)
    }


# -----------------------------------------------
# 4. MAIN — DEMO WITH SAMPLE PORTFOLIO
# -----------------------------------------------
if __name__ == "__main__":

    # --- Sample user portfolio ---
    # Replace this with actual user input later (Streamlit UI will feed this)
    user_stocks = [
        {"stock": "HDFC Bank Limited",              "amount": 50000},
        {"stock": "Infosys Limited",                "amount": 40000},
        {"stock": "Reliance Industries Limited",    "amount": 30000},
        {"stock": "Tata Consultancy Services Ltd.", "amount": 25000},
        {"stock": "ICICI Bank Limited",             "amount": 20000},
        {"stock": "Larsen & Toubro Limited",        "amount": 15000},
        {"stock": "Sun Pharmaceutical Inds. Ltd.",  "amount": 10000},
    ]

    # --- Load mapping ---
    print("Loading sector mapping...")
    mapping, mapping_upper = load_sector_mapping("data/fund_stocks_clean_grouped.csv")
    print(f"  Mapping loaded: {len(mapping)} stocks")

    # --- Process portfolio ---
    print("\nProcessing user portfolio...")
    sector_vector, unmatched = process_user_portfolio(user_stocks, mapping, mapping_upper)

    if unmatched:
        print(f"\n  Warning: {len(unmatched)} stock(s) not found in mapping:")
        for s in unmatched:
            print(f"    - {s}")

    # --- Show sector vector ---
    print("\nSector Allocation Vector:")
    print("-" * 40)
    for sector, pct in sorted(sector_vector.items(), key=lambda x: -x[1]):
        print(f"  {sector:<35} {pct:.3f}%")

    # --- Compute metrics ---
    metrics = compute_metrics(sector_vector)
    print("\nDiversification Metrics:")
    print("-" * 40)
    for k, v in metrics.items():
        print(f"  {k:<20} {v}")