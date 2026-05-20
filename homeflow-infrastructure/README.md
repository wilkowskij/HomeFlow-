# homeflow-infrastructure

Docker Compose, GitHub Actions CI/CD, and Terraform stubs for the HomeFlow platform.

## Local Development (Docker Compose)

```bash
# From this directory
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

docker compose up --build
```

Services:
| Service | URL |
|---|---|
| Frontend (homeflow-web) | http://localhost:5173 |
| API (homeflow-api) | http://localhost:3001 |
| AI Service (homeflow-ai-service) | http://localhost:8000 |
| API Docs (FastAPI) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## CI/CD (GitHub Actions)

Three workflows in `.github/workflows/`:
- `ci-web.yml` — Lint, type-check, build, Docker push for homeflow-web
- `ci-api.yml` — Lint, type-check, build, Docker push for homeflow-api
- `ci-ai-service.yml` — Lint, test, Docker push for homeflow-ai-service

All workflows push images to GitHub Container Registry (`ghcr.io`) on `main` branch merges.

### Required GitHub Secrets
| Secret | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `GITHUB_TOKEN` | Auto-provided by GitHub for GHCR |

## Terraform (AWS — Stub)

Infrastructure-as-code stubs in `terraform/` for AWS deployment:
- VPC with public/private subnets
- RDS PostgreSQL
- ECS Fargate for all three services

```bash
cd terraform
terraform init
terraform plan -var="db_password=..." -var="anthropic_api_key=..."
terraform apply
```

> **Note**: Terraform modules are stubs. Complete them with your AWS account details before deploying to production.

## Environment Variables

Copy `.env.example` to `.env` for local docker-compose:
```bash
cp .env.example .env
```
