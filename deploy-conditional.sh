#!/bin/bash

# Deploy Conditional Analysis Lambda
# Usage: ./deploy-conditional.sh [function-name]

FUNCTION_NAME=${1:-conditional-analysis-lambda}

echo "🚀 Deploying Conditional Analysis Lambda: $FUNCTION_NAME"

# Create deployment package
echo "📦 Creating deployment package..."
zip -r conditional-analysis.zip handlers/conditionalAnalysis.js utils/ node_modules/ -x "*.git*" "*.md" "test-*.js"

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME 2>/dev/null; then
    echo "⬆️  Updating existing function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://conditional-analysis.zip
    
    echo "✅ Function updated successfully!"
else
    echo "❌ Function $FUNCTION_NAME does not exist."
    echo "Please create it first using AWS Console or CLI."
    echo ""
    echo "Example create command:"
    echo "aws lambda create-function \\"
    echo "  --function-name $FUNCTION_NAME \\"
    echo "  --runtime nodejs18.x \\"
    echo "  --role arn:aws:iam::ACCOUNT_ID:role/lambda-role \\"
    echo "  --handler handlers/conditionalAnalysis.handler \\"
    echo "  --zip-file fileb://conditional-analysis.zip \\"
    echo "  --timeout 60 \\"
    echo "  --memory-size 512"
    exit 1
fi

echo "🧹 Cleaning up..."
rm conditional-analysis.zip

echo "✨ Deployment complete!"
