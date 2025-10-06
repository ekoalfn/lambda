#!/bin/bash

# AWS Lambda Deployment Script
# Usage: ./deploy.sh [function-name]

FUNCTION_NAME=${1:-lambda-openai-integration}

echo "🚀 Deploying Lambda function: $FUNCTION_NAME"

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME 2>/dev/null; then
    echo "📦 Creating deployment package..."
    zip -r function.zip . -x "*.git*" "node_modules/.bin/*" "*.sh" "*.md" "function.zip"
    
    echo "⬆️  Updating function code..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip
    
    echo "✅ Function updated successfully!"
else
    echo "❌ Function $FUNCTION_NAME does not exist."
    echo "Please create it first using AWS Console or CLI."
    exit 1
fi

echo "🧹 Cleaning up..."
rm function.zip

echo "✨ Deployment complete!"
