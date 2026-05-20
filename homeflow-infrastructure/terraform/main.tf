terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Uncomment for remote state:
  # backend "s3" {
  #   bucket = "homeflow-terraform-state"
  #   key    = "prod/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
}

# ─── VPC ──────────────────────────────────────────────────────────────────────
module "vpc" {
  source = "./modules/vpc"
  project     = var.project
  environment = var.environment
  cidr_block  = "10.0.0.0/16"
}

# ─── RDS (PostgreSQL) ─────────────────────────────────────────────────────────
module "rds" {
  source      = "./modules/rds"
  project     = var.project
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  db_name     = "homeflow_db"
  db_username = var.db_username
  db_password = var.db_password
}

# ─── ECS (App Services) ───────────────────────────────────────────────────────
module "ecs" {
  source          = "./modules/ecs"
  project         = var.project
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnet_ids
  private_subnets = module.vpc.private_subnet_ids
  api_image       = var.api_image
  ai_image        = var.ai_image
  web_image       = var.web_image
  database_url    = module.rds.connection_string
  anthropic_api_key = var.anthropic_api_key
}
