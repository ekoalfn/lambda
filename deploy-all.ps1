# PowerShell Deployment Script for Both Lambda Functions
# Usage: .\deploy-all.ps1

Write-Host "🚀 Deploying Both Lambda Functions" -ForegroundColor Green
Write-Host ""

# Function 1: Static Analysis
Write-Host "📦 [1/2] Packaging Static Analysis Lambda..." -ForegroundColor Cyan
Compress-Archive -Path handlers/staticAnalysis.js, utils/, node_modules/ -DestinationPath static-analysis.zip -Force

$functionName1 = "static-analysis-lambda"
Write-Host "⬆️  Updating $functionName1..." -ForegroundColor Yellow

try {
    aws lambda update-function-code `
        --function-name $functionName1 `
        --zip-file fileb://static-analysis.zip
    Write-Host "✅ Static Analysis updated successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update Static Analysis Lambda" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""

# Function 2: Conditional Analysis
Write-Host "📦 [2/2] Packaging Conditional Analysis Lambda..." -ForegroundColor Cyan
Compress-Archive -Path handlers/conditionalAnalysis.js, utils/, node_modules/ -DestinationPath conditional-analysis.zip -Force

$functionName2 = "conditional-analysis-lambda"
Write-Host "⬆️  Updating $functionName2..." -ForegroundColor Yellow

try {
    aws lambda update-function-code `
        --function-name $functionName2 `
        --zip-file fileb://conditional-analysis.zip
    Write-Host "✅ Conditional Analysis updated successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update Conditional Analysis Lambda" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "🧹 Cleaning up..." -ForegroundColor Cyan
Remove-Item static-analysis.zip -ErrorAction SilentlyContinue
Remove-Item conditional-analysis.zip -ErrorAction SilentlyContinue

Write-Host "✨ Deployment complete!" -ForegroundColor Green
