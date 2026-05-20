from fastapi import APIRouter, HTTPException
from app.models.schemas import NeighborhoodInsightRequest, NeighborhoodInsight
from app.services.claude_service import call_claude_json

router = APIRouter()

SYSTEM_PROMPT = """You are a NJ real estate market expert providing neighborhood insights.
Use your knowledge of New Jersey towns, school districts, commute patterns, and market trends.
Return realistic, helpful data. Always return valid JSON."""


@router.post("/neighborhood", response_model=NeighborhoodInsight)
async def get_neighborhood_insights(req: NeighborhoodInsightRequest):
    """Generate neighborhood insights for a property location."""
    try:
        profile_context = ""
        if req.buyer_profile:
            profile_context = f"\nBuyer priorities: must-haves={req.buyer_profile.must_haves}, commute to={req.buyer_profile.commute_location}"

        prompt = f"""Provide neighborhood insights for this NJ property:
Address: {req.address}, {req.city}, NJ{profile_context}

Return a JSON object with realistic estimates for {req.city}, NJ:
- school_rating (float 1-10): local school district quality
- commute_estimate_minutes (int or null): estimated commute to NYC/nearby hub
- walkability_score (int 0-100): walkability
- safety_index (float 0-10): relative safety, 10 being safest
- median_household_income (int or null): area median income
- median_home_price (int or null): neighborhood median home price
- price_trend_pct_1yr (float): price change % over last year (e.g. 4.2 for +4.2%)
- ai_summary (string, 2-3 sentences): neighborhood overview for this buyer
- highlights (array of 3-4 strings): top positives
- watch_outs (array of 1-3 strings): things to be aware of"""

        data = await call_claude_json(prompt, SYSTEM_PROMPT)
        return NeighborhoodInsight(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/market/{city}")
async def get_market_summary(city: str):
    """Get current market conditions for a NJ city."""
    try:
        prompt = f"""Provide a brief market summary for {city}, NJ real estate as of early 2026.
Return JSON with:
- market_heat (string): "HOT" | "WARM" | "NEUTRAL" | "COOL"
- avg_days_on_market (int): typical days on market
- list_to_sale_ratio (float): avg sale/list price ratio e.g. 1.02
- inventory_level (string): "LOW" | "MODERATE" | "HIGH"  
- yoy_price_change_pct (float): year-over-year price change %
- buyer_competition (string): brief description of competition level
- ai_summary (string, 2 sentences): actionable market insight for a buyer"""

        data = await call_claude_json(prompt, SYSTEM_PROMPT)
        return {"city": city, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare-summary")
async def get_comparison_summary(body: dict):
    """Generate AI comparison summary for multiple properties."""
    try:
        properties = body.get("properties", [])
        buyer_profile = body.get("buyer_profile", {})

        if len(properties) < 2:
            raise HTTPException(status_code=400, detail="At least 2 properties required for comparison")

        import json
        prompt = f"""A NJ home buyer is comparing these properties:
{json.dumps(properties, indent=2)}

Buyer profile priorities: {json.dumps(buyer_profile, indent=2)}

Return a JSON object with:
- winner_id (string): property id that best fits this buyer
- winner_reason (string): 1 sentence why
- property_summaries (array): one object per property with id, key_strength (string), key_weakness (string)
- overall_recommendation (string, 2-3 sentences): actionable advice"""

        data = await call_claude_json(prompt, SYSTEM_PROMPT, max_tokens=1500)
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
