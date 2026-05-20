from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    RecommendationRequest, RecommendationResult,
    PropertyProsConsRequest, PropertyProsCons,
)
from app.services.claude_service import call_claude_json
import json

router = APIRouter()

SYSTEM_PROMPT = """You are a NJ real estate AI assistant for HomeFlow. 
Analyze properties against buyer profiles and return structured JSON responses.
Be specific, practical, and reference NJ market context."""


@router.post("/", response_model=list[RecommendationResult])
async def get_recommendations(req: RecommendationRequest):
    """Score and rank properties against a buyer profile."""
    try:
        profile_str = json.dumps(req.buyer_profile.model_dump(), indent=2)
        props_str = json.dumps([p.model_dump() for p in req.available_properties], indent=2)

        prompt = f"""Given this buyer profile:
{profile_str}

Score each of these properties and return a JSON array of objects.
Each object must have:
- property_id (string): the property's id
- score (float 0-1): overall match score
- match_percentage (int 0-100): rounded percentage
- pros (array of 2-4 short strings): why this fits the buyer
- cons (array of 1-3 short strings): drawbacks for this buyer
- ai_summary (string, 1-2 sentences): personalized summary

Properties to score:
{props_str}

Return a JSON array sorted by score descending, limit {req.limit} results."""

        data = await call_claude_json(prompt, SYSTEM_PROMPT, max_tokens=2048)
        if not isinstance(data, list):
            data = data.get("recommendations", data.get("results", []))
        return [RecommendationResult(**item) for item in data[:req.limit]]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pros-cons", response_model=PropertyProsCons)
async def get_pros_cons(req: PropertyProsConsRequest):
    """Generate AI pros/cons for a specific property."""
    try:
        prop_str = json.dumps(req.property.model_dump(), indent=2)
        profile_str = json.dumps(req.buyer_profile.model_dump(), indent=2) if req.buyer_profile else "No profile provided"

        prompt = f"""Analyze this NJ property for a home buyer:
Property: {prop_str}
Buyer Profile: {profile_str}

Return a JSON object with:
- pros (array of 3-5 strings): genuine selling points
- cons (array of 2-4 strings): honest drawbacks  
- overall_fit_score (int 0-100): fit for this buyer
- summary (string, 2-3 sentences): overall assessment"""

        data = await call_claude_json(prompt, SYSTEM_PROMPT)
        return PropertyProsCons(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
