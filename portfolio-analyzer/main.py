import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import AnalysisRequest, AnalysisReport, ChatRequest
from services.pipeline import run_analysis_pipeline
from services.chatbot import get_chatbot_response
from dotenv import load_dotenv
from services.chatbot import get_chatbot_response, get_report_narrative

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
STOCKS_CSV = "data/fund_stocks_clean.csv"
mf_data = pd.DataFrame()
stocks_data = pd.DataFrame()

@app.on_event("startup")
async def startup_event():
    global mf_data, stocks_data
    if os.path.exists(MUTUAL_FUNDS_CSV):
        mf_data = pd.read_csv(MUTUAL_FUNDS_CSV)
    else:
        print(f"Warning: {MUTUAL_FUNDS_CSV} not found!")
        
    if os.path.exists(STOCKS_CSV):
        stocks_data = pd.read_csv(STOCKS_CSV)
    else:
        print(f"Warning: {STOCKS_CSV} not found!")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


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