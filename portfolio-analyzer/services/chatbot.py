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
# REPORT GENERATOR PROMPT
# =========================================================

REPORT_SYSTEM_PROMPT = """
You are a professional portfolio analysis assistant.

Your task is to generate a detailed but readable
investment analysis report for a retail investor.

Guidelines:
- Be analytical but easy to understand
- Explain concepts in plain English
- Avoid excessive jargon
- Use short paragraphs
- Keep a professional but modern tone
- Focus on interpretation, not just metrics
- Do not overwhelm the user with numbers
- Do not give direct financial advice
"""


# =========================================================
# CHATBOT SYSTEM PROMPT
# =========================================================

CHATBOT_SYSTEM_PROMPT = """
You are a modern fintech portfolio assistant.

You help users understand their portfolio
in a conversational and highly readable way.

Your style:
- concise
- natural
- insightful
- calm
- practical

Rules:
- Keep responses short unless the user asks for detail
- Prefer short paragraphs
- Avoid essay-style answers
- Avoid sounding academic or corporate
- Use simple investing language
- Do not explain every metric unless necessary
- Focus only on what the user asked
- Do not repeat the full report
- Mention only the most relevant insights
- Avoid large bullet lists
- Avoid generic textbook explanations
- Avoid unnecessary disclaimers
- Never overload the user with statistics

Good response style example:
"Your portfolio is fairly diversified overall,
but you're still heavily tilted toward IT and Financials.
That means performance may depend too much on those sectors."

Bad response style example:
"The portfolio diversification entropy metric indicates..."

Do not give direct buy/sell advice.
"""


# =========================================================
# REPORT CONTEXT BUILDER
# =========================================================

def _build_report_context(report: AnalysisReport) -> str:
    """
    Creates a compact and readable portfolio context
    instead of dumping raw data blindly.
    """

    return f"""
PORTFOLIO SUMMARY

Selected Benchmark Fund:
{report.selected_fund_name}

Diversification Score:
{report.diversification_score}

Sector Allocation:
{report.sector_allocation}

Key Risk Signals:
{report.severity_flags}

Missing Sectors:
{report.missing_sectors}

Overexposed Sectors:
{report.over_exposed_sectors}

Gap Analysis vs Benchmark:
{report.gap_analysis}

Portfolio Statistics:
- Entropy: {report.entropy}
- HHI: {report.hhi}
- Coverage: {report.coverage}
- Concentration Ratio: {report.concentration_ratio}
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

Generate a portfolio analysis report with:

1. Portfolio Overview
2. Sector Breakdown
3. Diversification Health
4. Benchmark Comparison
5. Key Risks and Strengths
6. Suggested Areas for Further Research

Guidelines:
- Keep the report readable
- Use natural language
- Avoid giant paragraphs
- Explain implications clearly
- Focus more on insights than raw metrics
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.6,
            max_tokens=1200,
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
            temperature=0.7,
            max_tokens=300,
            messages=messages
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error communicating with Groq API: {str(e)}"