#!/bin/bash

# Deploy Static Analysis Lambda
# Usage: ./deploy-static.sh [function-name]

FUNCTION_NAME=${1:-static-analysis-lambda}

echo "🚀 Deploying Static Analysis Lambda: $FUNCTION_NAME"

# Create deployment package
echo "📦 Creating deployment package..."
zip -r static-analysis.zip handlers/staticAnalysis.js utils/ node_modules/ -x "*.git*" "*.md" "test-*.js"

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME 2>/dev/null; then
    echo "⬆️  Updating existing function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://static-analysis.zip
    
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
    echo "  --handler handlers/staticAnalysis.handler \\"
    echo "  --zip-file fileb://static-analysis.zip \\"
    echo "  --timeout 60 \\"
    echo "  --memory-size 512"
    exit 1
fi

echo "🧹 Cleaning up..."
rm static-analysis.zip

echo "✨ Deployment complete!"
