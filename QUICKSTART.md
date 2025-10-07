# Quick Start Guide

## 🚀 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy template
cp .env.example .env

# Edit .env dengan credentials Anda
# - OPENAI_API_KEY: API key dari Sumopod
# - REST_API_URL: URL AWS Serverless API Anda
# - REST_API_KEY: API key untuk authentication
```

### 3. Test Locally
```bash
# Test Script 1 (Static Analysis)
npm run test:static

# Test Script 2 (Conditional Analysis)
npm run test:conditional

# Test both
npm run test:all
```

## 📦 Deployment

### Deploy ke AWS Lambda

**Option 1: Deploy semua (PowerShell)**
```powershell
npm run deploy:all
```

**Option 2: Deploy individual (Bash)**
```bash
# Static Analysis
npm run deploy:static

# Conditional Analysis
npm run deploy:conditional
```

## 🔧 Customization

### Ubah Pertanyaan Analisis

Edit `.env`:
```env
STATIC_ANALYSIS_QUESTION=Your custom question here?
CONDITIONAL_ANALYSIS_QUESTION=Your custom question for Data5?
```

### Ubah Schedule EventBridge

```bash
# Static Analysis - setiap 2 jam
aws events put-rule --name static-analysis-trigger --schedule-expression "rate(2 hours)"

# Conditional Analysis - setiap hari jam 9 pagi
aws events put-rule --name conditional-analysis-trigger --schedule-expression "cron(0 9 * * ? *)"
```

## 📊 Monitoring

### View Logs
```bash
# Static Analysis
aws logs tail /aws/lambda/static-analysis-lambda --follow

# Conditional Analysis
aws logs tail /aws/lambda/conditional-analysis-lambda --follow
```

### Test Invoke
```bash
# Static Analysis
aws lambda invoke --function-name static-analysis-lambda --payload '{}' response.json

# Conditional Analysis
aws lambda invoke --function-name conditional-analysis-lambda --payload '{}' response.json
```

## 📁 Project Structure

```
lambda/
├── handlers/              # Lambda handlers
│   ├── staticAnalysis.js
│   └── conditionalAnalysis.js
├── utils/                 # Shared utilities
│   ├── apiClient.js
│   └── openaiClient.js
├── test-*.js             # Local testing scripts
├── deploy-*.sh           # Deployment scripts (Bash)
├── deploy-all.ps1        # Deployment script (PowerShell)
└── .env                  # Your configuration
```

## 🔗 Documentation

- **README.md** - Complete guide
- **ARCHITECTURE.md** - System architecture & data flow
- **PROMPT_SYSTEM.md** - Dynamic prompt generation

## 💡 Common Commands

```bash
# Testing
npm run test:static          # Test static analysis
npm run test:conditional     # Test conditional analysis
npm run test:all            # Test both

# Deployment
npm run deploy:static        # Deploy static analysis
npm run deploy:conditional   # Deploy conditional analysis
npm run deploy:all          # Deploy both (PowerShell)
```

## ❓ Need Help?

1. Check **ARCHITECTURE.md** for detailed documentation
2. Check **README.md** for complete setup guide
3. Check logs: `aws logs tail /aws/lambda/FUNCTION_NAME --follow`

---

**Quick Start Version:** 1.0  
**Last Updated:** 2025-10-07
