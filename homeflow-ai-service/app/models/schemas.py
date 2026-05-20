from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class PropertyType(str, Enum):
    SINGLE_FAMILY = "SINGLE_FAMILY"
    TOWNHOUSE = "TOWNHOUSE"
    CONDO = "CONDO"
    MULTI_FAMILY = "MULTI_FAMILY"
    LAND = "LAND"


class BuyerProfile(BaseModel):
    locations: List[str] = Field(default_factory=list)
    budget_min: int = 300000
    budget_max: int = 700000
    bedrooms_min: int = 2
    bedrooms_max: Optional[int] = None
    bathrooms_min: float = 1.0
    property_types: List[PropertyType] = Field(default_factory=list)
    must_haves: List[str] = Field(default_factory=list)
    timeline: str = "WITHIN_6_MONTHS"
    commute_location: Optional[str] = None


class Property(BaseModel):
    id: str
    address: str
    city: str
    state: str = "NJ"
    zip: str
    price: int
    bedrooms: int
    bathrooms: float
    square_feet: Optional[int] = None
    lot_size: Optional[float] = None
    year_built: Optional[int] = None
    property_type: PropertyType
    description: Optional[str] = None
    photos: List[str] = Field(default_factory=list)
    days_on_market: int = 0
    lat: Optional[float] = None
    lng: Optional[float] = None


class RecommendationRequest(BaseModel):
    buyer_profile: BuyerProfile
    available_properties: List[Property]
    limit: int = Field(default=10, ge=1, le=50)


class RecommendationResult(BaseModel):
    property_id: str
    score: float
    match_percentage: int
    pros: List[str]
    cons: List[str]
    ai_summary: str


class SearchRequest(BaseModel):
    query: str
    buyer_profile: Optional[BuyerProfile] = None


class ParsedSearchFilters(BaseModel):
    locations: List[str] = Field(default_factory=list)
    price_min: Optional[int] = None
    price_max: Optional[int] = None
    bedrooms_min: Optional[int] = None
    bathrooms_min: Optional[float] = None
    property_types: List[PropertyType] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    near_transit: bool = False
    commute_max_minutes: Optional[int] = None


class NeighborhoodInsightRequest(BaseModel):
    property_id: str
    address: str
    city: str
    buyer_profile: Optional[BuyerProfile] = None


class NeighborhoodInsight(BaseModel):
    school_rating: float
    commute_estimate_minutes: Optional[int] = None
    walkability_score: int
    safety_index: float
    median_household_income: Optional[int] = None
    median_home_price: Optional[int] = None
    price_trend_pct_1yr: float
    ai_summary: str
    highlights: List[str]
    watch_outs: List[str]


class PropertyProsConsRequest(BaseModel):
    property: Property
    buyer_profile: Optional[BuyerProfile] = None


class PropertyProsCons(BaseModel):
    pros: List[str]
    cons: List[str]
    overall_fit_score: int
    summary: str
