variable "project" {
  description = "Project name"
  type        = string
  default     = "homeflow"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_username" {
  description = "PostgreSQL username"
  type        = string
  default     = "homeflow"
}

variable "db_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API key"
  type        = string
  sensitive   = true
}

variable "api_image" {
  description = "Docker image for homeflow-api"
  type        = string
}

variable "ai_image" {
  description = "Docker image for homeflow-ai-service"
  type        = string
}

variable "web_image" {
  description = "Docker image for homeflow-web"
  type        = string
}
