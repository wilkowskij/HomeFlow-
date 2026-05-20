# homeflow-ai-service

Python FastAPI service for HomeFlow's AI features: property recommendations, NLP search parsing, and neighborhood insights.

## Tech Stack
- **Framework**: FastAPI 0.115
- **AI**: Anthropic SDK (claude-sonnet-4-20250514)
- **Validation**: Pydantic v2
- **Runtime**: Python 3.12

## Getting Started

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/recommendations` | Score & rank properties for buyer |
| POST | `/api/recommendations/pros-cons` | AI pros/cons for one property |
| POST | `/api/search/parse` | NLP query → structured filters |
| POST | `/api/search/expand-criteria` | Suggest search expansions |
| POST | `/api/insights/neighborhood` | Neighborhood data + AI summary |
| GET | `/api/insights/market/{city}` | Market conditions for NJ city |
| POST | `/api/insights/compare-summary` | AI comparison of 2+ properties |
| GET | `/health` | Health check |

## Docs
Interactive API docs at `http://localhost:8000/docs` when running.

## Docker
```bash
docker build -t homeflow-ai-service .
docker run -p 8000:8000 --env-file .env homeflow-ai-service
```
