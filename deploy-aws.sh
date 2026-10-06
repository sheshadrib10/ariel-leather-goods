#!/bin/bash
set -e

echo "=========================================================="
echo "  ARIEL LEATHER GOODS - AWS CLOUD DEPLOYMENT SCRIPT"
echo "  Powered by Amazon Bedrock (Nova Micro + Titan Embeddings)"
echo "=========================================================="

REGION=${AWS_REGION:-"us-east-1"}
APP_NAME="ariel-leather-goods"

echo "Step 1: Checking AWS CLI status..."
aws sts get-caller-identity || {
  echo "Error: AWS CLI session is expired or not configured."
  echo "Run: 'aws login' or set AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY."
  exit 1
}

echo "Step 2: Building container image..."
docker build -t ${APP_NAME}:latest .

echo "Step 3: Ready for AWS App Runner / Amazon ECS deployment."
echo "Stack: CloudFront -> Next.js (App Runner/ECS) -> PostgreSQL + pgvector (RDS Aurora) -> Bedrock Runtime"
echo "Done!"
