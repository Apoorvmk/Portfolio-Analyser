import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import (
    AnalysisRequest, 
    AnalysisReport, 
    ChatRequest, 
    RecommendationRequest, 
    RecommendResponse,
    TopMatch
)
from services.pipeline import run_analysis_pipeline
from services.chatbot import get_chatbot_response, get_report_narrative
from cosine_similarity import load_benchmark_vectors, match_portfolio, get_classification
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Portfolio Diversification Analyzer API")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data variables
MUTUAL_FUNDS_CSV = "data/fund_sector_vectors.csv"
STOCKS_CSV = "data/fund_stocks_clean_grouped.csv"
mf_data = pd.DataFrame()
stocks_data = pd.DataFrame()
benchmark_df = pd.DataFrame()

@app.on_event("startup")
async def startup_event():
    global mf_data, stocks_data, benchmark_df
    if os.path.exists(MUTUAL_FUNDS_CSV):
        mf_data = pd.read_csv(MUTUAL_FUNDS_CSV)
    else:
        print(f"Warning: {MUTUAL_FUNDS_CSV} not found!")
        
    if os.path.exists(STOCKS_CSV):
        stocks_data = pd.read_csv(STOCKS_CSV)
    else:
        print(f"Warning: {STOCKS_CSV} not found!")
    
    # Load benchmark vectors for similarity matching
    FUND_METRICS_CSV = "data/fund_metrics.csv"
    if os.path.exists(MUTUAL_FUNDS_CSV) and os.path.exists(FUND_METRICS_CSV):
        benchmark_df = load_benchmark_vectors(MUTUAL_FUNDS_CSV, FUND_METRICS_CSV)
    else:
        benchmark_df = pd.DataFrame()
        print("Warning: Benchmark data files missing for recommendations.")

@app.get("/funds")
async def get_funds():
    """
    Returns list of available mutual fund names from the CSV.
    """
    if mf_data.empty:
        return {"funds": []}
    return {"funds": mf_data["fund_name"].tolist()}

@app.get("/stocks")
async def get_stocks():
    """
    Returns a unique list of stocks and their primary sectors.
    """
    if stocks_data.empty:
        return {"stocks": []}
    
    # Drop duplicates to get unique stocks and their sectors
    unique_stocks = stocks_data[['stock', 'sector']].drop_duplicates('stock')
    return {"stocks": unique_stocks.to_dict('records')}

@app.post("/analyze", response_model=AnalysisReport)
async def analyze_portfolio(request: AnalysisRequest):
    """
    Runs the full portfolio analysis pipeline.
    """
    if mf_data.empty:
        raise HTTPException(status_code=500, detail="Benchmark data not loaded")
    
    if request.selected_fund not in mf_data["fund_name"].values:
        raise HTTPException(status_code=400, detail=f"Fund '{request.selected_fund}' not found")
    
    try:
        report = run_analysis_pipeline(request, mf_data)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/chat")
async def chat_with_report(request: ChatRequest):
    """
    Handles chatbot interaction based on the analysis report.
    """
    try:
        response_text = get_chatbot_response(request)
        return {"assistant_response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.post("/report")
async def generate_report_narrative(request: AnalysisReport):
    """
    Generates a plain English descriptive narrative 
    of the analysis report using Claude.
    """
    try:
        narrative = get_report_narrative(request)
        return {"narrative": narrative}
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Report generation failed: {str(e)}"
        )

@app.post("/recommend", response_model=RecommendResponse)
async def recommend_funds(request: RecommendationRequest):
    """
    Finds the best matching mutual funds based on user's portfolio sector allocation.
    """
    if benchmark_df.empty:
        raise HTTPException(status_code=500, detail="Benchmark data not loaded")
    
    try:
        # Convert user portfolio to sector vector
        stocks_input = [s.dict() for s in request.portfolio.stocks]
        if not stocks_input:
            raise HTTPException(status_code=400, detail="Portfolio is empty")
        
        df_user = pd.DataFrame(stocks_input)
        sector_sums = df_user.groupby('sector')['amount_invested'].sum()
        total_invested = sector_sums.sum()
        
        if total_invested == 0:
            user_sector_vector = {}
        else:
            user_sector_vector = (sector_sums / total_invested * 100).to_dict()
        
        # Match against benchmarks
        results_df = match_portfolio(user_sector_vector, benchmark_df)
        classification = get_classification(results_df)
        
        top_match = TopMatch(
            fund_name=classification["top_match_fund"],
            category=classification["top_match_category"],
            similarity=classification["top_match_similarity"]
        )
        
        top_n = [
            TopMatch(
                fund_name=row["fund_name"],
                category=row["category"],
                similarity=row["similarity"]
            )
            for _, row in classification["top_n"].iterrows()
        ]
        
        return RecommendResponse(
            top_match=top_match,
            top_n=top_n,
            user_sector_vector=user_sector_vector
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")