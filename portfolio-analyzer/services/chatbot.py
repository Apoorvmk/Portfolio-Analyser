import os
from groq import Groq
from dotenv import load_dotenv

from models.schemas import ChatRequest, AnalysisReport

load_dotenv()


# =========================================================
# CLIENT
# =========================================================

def _get_client() -> Groq:
    api_key = os.getenv("Gorq_API_KEY")

    if not api_key:
        raise ValueError(
            "Groq API key not configured properly."
        )

    return Groq(api_key=api_key)


# =========================================================
# REPORT GENERATOR PROMPT (INSTITUTIONAL GRADE)
# =========================================================

REPORT_SYSTEM_PROMPT = """
You are a Senior Quantitative Portfolio Strategist.

Your task is to generate a high-precision, institutional-grade investment analysis report.

Guidelines:
- USE FINANCIAL TERMINOLOGY: Discuss P/E ratios, Beta coefficients, Standard Deviation, CAGR, and Alpha where relevant.
- BE QUANTITATIVE: Play with numbers more than words. Use percentages, basis points (bps), and ratios to explain gaps.
- BE SPECIFIC: Do not give generic diversification advice. Analyze the EXACT sectors and gaps provided.
- DEEP ANALYSIS: Look into sectoral correlation. For example, if the user is heavy in Banks and NBFCs, discuss the systemic interest rate risk.
- READABILITY: Use professional formatting. Avoid long essays. Use bullet points and bold figures.
- TONE: Professional, data-driven, and objective.
- NO GENERIC FILLER: Skip the "Diversification is important" intros. Dive straight into the data.
"""


# =========================================================
# CHATBOT SYSTEM PROMPT (QUANTITATIVE ASSISTANT)
# =========================================================

CHATBOT_SYSTEM_PROMPT = """
You are an AI Portfolio Quant. 

You provide precise, data-backed answers to portfolio strategy questions.

Your style:
- Precise (use exact numbers from the report)
- Sophisticated (use terms like 'overweight', 'tactical allocation', 'sectoral concentration')
- Concise (no fluff)

Rules:
- Focus on quantitative insights.
- If a user asks about a sector, discuss its valuation (P/E) or risk profile (Beta) based on the current market context.
- Keep responses short but dense with information.
- Avoid generic encouragement.
"""


# =========================================================
# REPORT CONTEXT BUILDER
# =========================================================

def _build_report_context(report: AnalysisReport) -> str:
    """
    Creates a dense quantitative context for the LLM.
    """

    return f"""
PORTFOLIO QUANT DATA:

BENCHMARK: {report.selected_fund_name}
HEALTH_INDEX: {report.diversification_score}/100

SECTOR_ALLOCATION_VECTOR:
{report.sector_allocation}

RISK_SIGNALS_SEVERITY:
{report.severity_flags}

CONCENTRATION_METRICS:
- Entropy: {report.entropy} (Lower = Higher Risk)
- HHI: {report.hhi} (Index of Market Concentration)
- Coverage Count: {report.coverage} sectors
- Top-1 Concentration Ratio: {report.concentration_ratio}%

BENCHMARK_GAP_ANALYSIS (User % - Benchmark %):
{report.gap_analysis}

MISSING_EXPOSURE: {report.missing_sectors}
OVERWEIGHT_EXPOSURE: {report.over_exposed_sectors}
"""


# =========================================================
# REPORT GENERATION
# =========================================================

def get_report_narrative(report: AnalysisReport) -> str:
    """
    Generates the initial detailed portfolio report.
    """

    try:
        client = _get_client()
    except ValueError as e:
        return str(e)

    context = _build_report_context(report)

    user_prompt = f"""
{context}

Generate an Executive Portfolio Diagnostic Report.

Structure:
1. Executive Summary (Quantitative highlight)
2. Sectoral Vector Analysis (Discussion of overweight/underweight positions in bps)
3. Concentration & HHI Risk Assessment
4. Benchmark Variance Diagnostic (Why the gap exists)
5. Strategic Optimization Paths (Specific sectoral shifts)

Constraint: Play with numbers. Use financial ratios. Keep it to-the-point.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.3, # Lower temperature for more consistent quantitative logic
            max_tokens=1000,
            messages=[
                {
                    "role": "system",
                    "content": REPORT_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error generating report narrative: {str(e)}"


# =========================================================
# CHATBOT RESPONSE
# =========================================================

def get_chatbot_response(request: ChatRequest) -> str:
    """
    Handles conversational chatbot responses.
    """

    try:
        client = _get_client()
    except ValueError as e:
        return str(e)

    context = _build_report_context(request.report)

    messages = [
        {
            "role": "system",
            "content": f"""
{CHATBOT_SYSTEM_PROMPT}

Portfolio Context:
{context}
"""
        }
    ]

    # Keep only recent conversation history
    recent_history = request.conversation_history[-6:]

    for msg in recent_history:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })

    messages.append({
        "role": "user",
        "content": request.message
    })

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_tokens=400,
            messages=messages
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error communicating with Groq API: {str(e)}"