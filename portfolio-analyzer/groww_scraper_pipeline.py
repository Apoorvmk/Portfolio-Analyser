# ================================================
# Groww MF Scraper + Diversification Pipeline
# ================================================
# HOW TO USE:
# Option A (Auto): Script will try to download latest Excel from Groww automatically
# Option B (Manual): Download Excel from growwmf.in/statutory-disclosure/portfolio
#                    and pass the path as argument: python script.py my_file.xls
# ================================================

import sys
import os
import io
import requests
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup

# -----------------------------------------------
# 1. DOWNLOAD LATEST EXCEL FROM GROWW
# -----------------------------------------------
GROWW_PORTFOLIO_URL = "https://www.growwmf.in/statutory-disclosure/portfolio"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

def get_latest_excel_url():
    """Scrape Groww portfolio page and return the latest Monthly Portfolio Excel URL."""
    print("Fetching Groww portfolio page...")
    r = requests.get(GROWW_PORTFOLIO_URL, headers=HEADERS, timeout=15)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    
    for a in soup.find_all("a", href=True):
        text = a.text.strip()
        href = a["href"]
        if "Monthly Portfolio" in text and ("xlsx" in href or "xls" in href):
            return href  # return first (latest) match
    
    raise ValueError("Could not find Monthly Portfolio link on Groww page.")


def download_excel(url):
    """Download Excel file from URL and return as bytes."""
    print(f"Downloading: {url}")
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return io.BytesIO(r.content)


# -----------------------------------------------
# 2. PARSE ALL SHEETS → STOCK-LEVEL DATA
# -----------------------------------------------
def parse_excel(file_source):
    """
    Parse all fund sheets from Groww monthly portfolio Excel.
    Returns a DataFrame with columns: fund_name, stock, sector, weightage
    """
    print("Parsing Excel sheets...")
    
    # Detect engine based on file extension
    if isinstance(file_source, str):
        engine = "xlrd" if file_source.endswith(".xls") else "openpyxl"
        xl = pd.ExcelFile(file_source, engine=engine)
    else:
        # BytesIO — try openpyxl first, fall back to xlrd
        try:
            xl = pd.ExcelFile(file_source, engine="openpyxl")
        except Exception:
            xl = pd.ExcelFile(file_source, engine="xlrd")

    sheets = [s for s in xl.sheet_names if s != "XDO_METADATA"]
    
    all_data = []
    for sheet in sheets:
        df = pd.read_excel(file_source if isinstance(file_source, str) else file_source,
                           engine="xlrd" if str(file_source).endswith(".xls") else "openpyxl",
                           sheet_name=sheet, header=None)
        
        # Fund name is in row 0, col 1 — strip the code prefix e.g. "IB01-"
        raw_name = str(df.iloc[0, 1])
        fund_name = raw_name.split("-", 1)[-1].strip()

        # Data starts at row 3
        # Col 1 = ISIN, Col 2 = Stock Name, Col 3 = Sector, Col 6 = % to Net Assets
        for i in range(3, len(df)):
            row = df.iloc[i]
            isin   = str(row[1]).strip()
            stock  = str(row[2]).strip()
            sector = str(row[3]).strip()
            weight = row[6]

            # Only keep equity rows — valid ISIN starts with "IN"
            if not isin.startswith("IN"):
                continue

            # Skip rows where sector column contains a number (misaligned debt rows)
            try:
                float(sector)
                continue
            except (ValueError, TypeError):
                pass

            # Skip blank or NaN sectors
            if sector in ["nan", "NaN", ""]:
                continue

            # Weight must be a valid positive number
            try:
                weight = float(weight)
            except (ValueError, TypeError):
                continue
            if weight <= 0:
                continue

            all_data.append({
                "fund_name": fund_name,
                "stock":     stock,
                "sector":    sector,
                "weightage": weight
            })

    df_out = pd.DataFrame(all_data)
    print(f"  Parsed {len(df_out)} stock rows across {df_out['fund_name'].nunique()} funds")
    return df_out


# -----------------------------------------------
# 3. CATEGORY EXTRACTION FROM FUND NAME
# -----------------------------------------------
def get_category(name):
    n = name.lower()
    if any(x in n for x in ['liquid', 'overnight', '1d rate', 'gilt', 'bond', 'short duration', 'dynamic bond']):
        return 'Debt'
    if any(x in n for x in ['gold', 'silver']):
        return 'Commodity'
    if 'elss' in n:
        return 'ELSS'
    if 'large cap' in n:
        return 'Large Cap'
    if 'smallcap' in n or 'small cap' in n:
        return 'Small Cap'
    if 'multicap' in n or 'multi cap' in n:
        return 'Multi Cap'
    if 'multi asset' in n:
        return 'Multi Asset'
    if 'aggressive hybrid' in n:
        return 'Hybrid'
    if 'value' in n:
        return 'Value'
    if any(x in n for x in ['nifty 50', 'nifty next 50', 'nifty total market', 'nifty 200', 'nifty 500']):
        return 'Index'
    if any(x in n for x in ['banking', 'defence', 'ev ', 'internet', 'railways', 'power', 'consumer']):
        return 'Sectoral/Thematic'
    return 'Other'


# -----------------------------------------------
# 4. PIPELINE — SECTOR VECTORS + METRICS
# -----------------------------------------------
def normalized_entropy(row):
    """Shannon entropy normalized by log(n sectors)."""
    r = row[row > 0] / 100
    if len(r) == 0:
        return 0
    H = -np.sum(r * np.log(r + 1e-10))
    H_max = np.log(len(r))
    return H / H_max if H_max != 0 else 0


def hhi(row):
    """Herfindahl-Hirschman Index — sum of squared weights."""
    return ((row / 100) ** 2).sum()


def run_pipeline(df_stocks):
    """
    Convert stock-level data → sector allocation vectors → metrics.
    Returns pivot_df with entropy, hhi, div_score, sector_coverage, max_sector, max_weight.
    """
    print("Running diversification pipeline...")

    # Sector allocation vector per fund
    pivot = df_stocks.pivot_table(
        index="fund_name",
        columns="sector",
        values="weightage",
        aggfunc="sum",
        fill_value=0
    )

    # Normalize so each fund sums to 100%
    pivot = pivot.div(pivot.sum(axis=1), axis=0) * 100

    sector_cols = pivot.columns.tolist()

    # Metrics
    pivot["entropy"]          = pivot[sector_cols].apply(normalized_entropy, axis=1)
    pivot["hhi"]              = pivot[sector_cols].apply(hhi, axis=1)
    pivot["div_score"]        = ((pivot["entropy"] + (1 - pivot["hhi"])) / 2) * 100
    pivot["sector_coverage"]  = pivot[sector_cols].apply(lambda r: (r > 0).sum(), axis=1)
    pivot["max_sector"]       = pivot[sector_cols].apply(
        lambda r: r[r > 0].idxmax() if r.max() > 0 else "Unknown", axis=1
    )
    pivot["max_weight"]       = pivot[sector_cols].max(axis=1)
    pivot["category"]         = pivot.index.map(get_category)

    return pivot, sector_cols


# -----------------------------------------------
# 5. MAIN
# -----------------------------------------------
def main():
    # --- Determine file source ---
    if len(sys.argv) > 1:
        # Manual mode: file path passed as argument
        file_path = sys.argv[1]
        if not os.path.exists(file_path):
            print(f"Error: File not found — {file_path}")
            sys.exit(1)
        print(f"Using local file: {file_path}")
        file_source = file_path
    else:
        # Auto mode: download from Groww
        try:
            url = get_latest_excel_url()
            file_source = download_excel(url)
        except Exception as e:
            print(f"\nAuto-download failed: {e}")
            print("Please download the Excel manually from:")
            print("  https://www.growwmf.in/statutory-disclosure/portfolio")
            print("Then run: python groww_scraper_pipeline.py <path_to_file>")
            sys.exit(1)

    # --- Parse + Pipeline ---
    df_stocks = parse_excel(file_source)
    pivot, sector_cols = run_pipeline(df_stocks)

    # --- Save outputs ---
    metric_cols = ["category", "entropy", "hhi", "div_score", "sector_coverage", "max_sector", "max_weight"]

    # 1. Summary metrics per fund
    summary = pivot[metric_cols].round(4)
    summary.to_csv("fund_metrics.csv")
    print("\nSaved: fund_metrics.csv")

    # 2. Full sector allocation vectors (for cosine similarity later)
    vectors = pivot[sector_cols].round(3)
    vectors.to_csv("fund_sector_vectors.csv")
    print("Saved: fund_sector_vectors.csv")

    # 3. Raw stock-level clean data
    df_stocks.to_csv("fund_stocks_clean.csv", index=False)
    print("Saved: fund_stocks_clean.csv")

    # --- Print summary ---
    print("\n" + "="*60)
    print("RESULTS SUMMARY")
    print("="*60)
    print(summary.to_string())
    print(f"\nTotal funds processed: {len(summary)}")
    print(f"Total sectors found:   {len(sector_cols)}")


if __name__ == "__main__":
    main()