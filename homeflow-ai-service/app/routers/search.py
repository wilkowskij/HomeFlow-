from fastapi import APIRouter, HTTPException
from app.models.schemas import SearchRequest, ParsedSearchFilters
from app.services.claude_service import call_claude_json

router = APIRouter()

SYSTEM_PROMPT = """You are a NJ real estate search parser. 
Extract structured search filters from natural language queries.
Return only valid JSON matching the requested schema."""


@router.post("/parse", response_model=ParsedSearchFilters)
async def parse_search_query(req: SearchRequest):
    """Parse a natural language search query into structured filters."""
    try:
        prompt = f"""Parse this NJ real estate search query into structured filters:
Query: "{req.query}"

Return a JSON object with these fields (use null for unspecified values):
- locations: array of NJ city/town names mentioned or implied (e.g. ["Freehold", "Marlboro"])
- price_min: minimum price as integer or null
- price_max: maximum price as integer or null
- bedrooms_min: minimum bedrooms as integer or null
- bathrooms_min: minimum bathrooms as float or null
- property_types: array from [SINGLE_FAMILY, TOWNHOUSE, CONDO, MULTI_FAMILY, LAND] or []
- keywords: array of other relevant keywords (e.g. ["garage", "pool", "basement"])
- near_transit: boolean, true if transit/train station mentioned
- commute_max_minutes: max commute time in minutes as integer or null

Examples:
- "3 bed homes under 550k near train in Freehold NJ" → locations:["Freehold"], price_max:550000, bedrooms_min:3, near_transit:true
- "townhouse with 2 bathrooms in Marlboro or Howell" → locations:["Marlboro","Howell"], bathrooms_min:2, property_types:["TOWNHOUSE"]"""

        data = await call_claude_json(prompt, SYSTEM_PROMPT)
        return ParsedSearchFilters(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/expand-criteria")
async def expand_search_criteria(req: SearchRequest):
    """Suggest expanded criteria when no results found."""
    try:
        prompt = f"""A NJ home buyer searched for: "{req.query}" but found no results.
Suggest 3-4 practical ways to expand their search. 
Return JSON array of objects with:
- suggestion (string): what to change
- rationale (string): why this might help
- one_tap_label (string): short button label e.g. "Expand to Howell"
- filter_update (object): the filter key-value to apply"""

        data = await call_claude_json(prompt, SYSTEM_PROMPT)
        if isinstance(data, dict):
            data = data.get("suggestions", [])
        return {"suggestions": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
