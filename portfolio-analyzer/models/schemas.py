from pydantic import BaseModel
from typing import List, Dict, Optional

class StockInput(BaseModel):
    stock_name: str
    amount_invested: float
    sector: str

class PortfolioInput(BaseModel):
    stocks: List[StockInput]

class AnalysisRequest(BaseModel):
    portfolio: PortfolioInput
    selected_fund: str

class AnalysisReport(BaseModel):
    sector_allocation: Dict[str, float]
    entropy: float
    hhi: float
    coverage: int
    concentration_ratio: float
    gap_analysis: Dict[str, float]
    severity_flags: Dict[str, str]
    missing_sectors: List[str]
    over_exposed_sectors: List[str]
    diversification_score: float
    selected_fund_name: str

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage]
    report: AnalysisReport
