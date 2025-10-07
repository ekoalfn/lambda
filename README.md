# AWS Lambda Automation Scripts + OpenAI Integration

Sistem automation Lambda yang memanggil AWS Serverless REST API Anda, memproses data dengan OpenAI, dan mengirim hasil kembali ke API sebagai single source of truth.

## 🎯 Architecture

```
EventBridge → Lambda Scripts → Your REST API ⟷ OpenAI
                                (Source of Truth)
```

**Your REST API** tetap menjadi single source of truth. Lambda hanya sebagai automation layer yang:
1. Fetch data dari API Anda
2. Analyze dengan OpenAI
3. Post result kembali ke API Anda

## 📋 Features

- ✅ **2 Automation Scripts** - Static Analysis & Conditional Analysis
- ✅ **Dynamic Prompt Generation** - AI-powered intelligent prompts
- ✅ **REST API Integration** - Seamless communication with your API
- ✅ **Conditional Logic** - Smart execution based on data state
- ✅ **OpenAI Integration** - Sumopod AI support (gpt-4o-mini)
- ✅ **Error Handling** - Comprehensive retry and error management
- ✅ **Local Testing** - Mock API for development

## 🏗️ Project Structure

```
lambda/
├── handlers/
│   ├── staticAnalysis.js        # Script 1: Static Analysis
│   └── conditionalAnalysis.js   # Script 2: Conditional Analysis
├── utils/
│   ├── apiClient.js             # REST API client wrapper
│   └── openaiClient.js          # OpenAI client with dynamic prompts
├── test-staticAnalysis.js       # Local test for Script 1
├── test-conditionalAnalysis.js  # Local test for Script 2
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
├── ARCHITECTURE.md              # Detailed architecture documentation
├── PROMPT_SYSTEM.md             # Dynamic prompt system docs
└── README.md                    # This file
```

## 🤖 Automation Scripts

### Script 1: Static Analysis

**Purpose:** Analisis statis untuk menghasilkan actionable tasks

**Flow:**
1. Fetch Data1, Data2, Data3 dari REST API
2. Build prompt: "For Data1, Data2, and Data3 what will actionable task?"
3. Send to OpenAI → get result
4. Post back result sebagai Data4

**Trigger:** EventBridge scheduled (e.g., every 1 hour)

**Use Case Example:**
- Data1: Weather conditions
- Data2: Sales performance
- Data3: Inventory levels
- → AI Result (Data4): "Reorder inventory due to weather forecast"

---

### Script 2: Conditional Analysis

**Purpose:** Analisis kondisional - hanya jika Data6 kosong

**Flow:**
1. Fetch Data1, Data2, Data3, Data5, Data6 dari REST API
2. Check if Data6 is empty:
   - **NOT empty** → Skip (do nothing)
   - **Empty** → Continue
3. Build prompt: "For Data1, Data2, and Data3 what will Data5?"
4. Send to OpenAI → get result
5. Post back result sebagai Data6

**Trigger:** EventBridge scheduled (e.g., every 30 minutes)

**Use Case Example:**
- Data1: Revenue data
- Data2: Customer metrics
- Data3: Market share
- Data5: Target metric ("profit_margin")
- Data6: Empty (needs calculation)
- → AI Result (Data6): "Expected profit margin of 30%"

---

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` dan isi dengan konfigurasi Anda:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-sumopod-api-key
OPENAI_BASE_URL=https://ai.sumopod.com/v1
OPENAI_MODEL=gpt-4o-mini
MAX_TOKENS=400

# Your AWS Serverless REST API
REST_API_URL=https://your-api.execute-api.us-east-1.amazonaws.com/prod
REST_API_KEY=your_rest_api_key

# API Endpoints
FETCH_ENDPOINT=/data
POST_ENDPOINT=/data

# Custom Questions (Optional)
STATIC_ANALYSIS_QUESTION=Based on Data1, Data2, and Data3, what are the actionable tasks?
CONDITIONAL_ANALYSIS_QUESTION=Based on Data1, Data2, and Data3, what will be the result for Data5?
```

### 3. Test Locally

```bash
# Test Static Analysis
npm run test:static

# Test Conditional Analysis
npm run test:conditional

# Test both
npm run test:all
```

### 4. Deploy to AWS

#### Deploy Static Analysis Lambda

```bash
# Package
zip -r static-analysis.zip handlers/staticAnalysis.js utils/ node_modules/

# Create Lambda
aws lambda create-function \
  --function-name static-analysis-lambda \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-role \
  --handler handlers/staticAnalysis.handler \
  --zip-file fileb://static-analysis.zip \
  --timeout 60 \
  --memory-size 512 \
  --environment Variables="{OPENAI_API_KEY=sk-xxx,REST_API_URL=https://your-api.com,OPENAI_BASE_URL=https://ai.sumopod.com/v1}"
```

#### Deploy Conditional Analysis Lambda

```bash
# Package
zip -r conditional-analysis.zip handlers/conditionalAnalysis.js utils/ node_modules/

# Create Lambda
aws lambda create-function \
  --function-name conditional-analysis-lambda \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-role \
  --handler handlers/conditionalAnalysis.handler \
  --zip-file fileb://conditional-analysis.zip \
  --timeout 60 \
  --memory-size 512 \
  --environment Variables="{OPENAI_API_KEY=sk-xxx,REST_API_URL=https://your-api.com,OPENAI_BASE_URL=https://ai.sumopod.com/v1}"
```

#### Setup EventBridge Triggers

```bash
# Static Analysis - Every 1 hour
aws events put-rule --name static-analysis-trigger --schedule-expression "rate(1 hour)"
aws events put-targets --rule static-analysis-trigger --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT:function:static-analysis-lambda"
aws lambda add-permission --function-name static-analysis-lambda --statement-id AllowEventBridge --action lambda:InvokeFunction --principal events.amazonaws.com

# Conditional Analysis - Every 30 minutes
aws events put-rule --name conditional-analysis-trigger --schedule-expression "rate(30 minutes)"
aws events put-targets --rule conditional-analysis-trigger --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT:function:conditional-analysis-lambda"
aws lambda add-permission --function-name conditional-analysis-lambda --statement-id AllowEventBridge --action lambda:InvokeFunction --principal events.amazonaws.com
```

---

## 📊 REST API Requirements

Your AWS Serverless REST API harus menyediakan:

### GET Endpoint (Fetch Data)

**Request:**
```
GET /data
Authorization: Bearer YOUR_API_KEY
```

**Response Format:**
```json
{
  "data1": { ... },
  "data2": { ... },
  "data3": { ... },
  "data5": { ... },  // For conditional analysis
  "data6": null      // For conditional analysis
}
```

### POST Endpoint (Save Result)

**Request:**
```
POST /data
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "data4": "AI analysis result...",  // From static analysis
  "metadata": {
    "processedAt": "2025-10-07T10:30:00.000Z",
    "source": "static-analysis-lambda"
  }
}
```

**Response:**
```json
{
  "success": true,
  "id": "record-123"
}
```

---

## 🧠 Dynamic Prompt System

Sistem menggunakan **intelligent prompt generation** yang otomatis:

1. **Analyze Data Structure** - Deteksi tipe dan struktur data
2. **Detect Domain** - Recognize financial, weather, content, etc.
3. **Generate Context** - Build metadata dan field descriptions
4. **Create Instructions** - Domain-specific analysis instructions
5. **Build Prompt** - Combine everything into optimal prompt

**Lihat [PROMPT_SYSTEM.md](./PROMPT_SYSTEM.md) untuk detail lengkap.**

---

## 📖 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed system architecture, data flow, examples
- **[PROMPT_SYSTEM.md](./PROMPT_SYSTEM.md)** - Dynamic prompt generation system
- **[README.md](./README.md)** - This file (quick start guide)

---

## 🔍 Monitoring & Logs

### CloudWatch Logs

```bash
# Static Analysis logs
aws logs tail /aws/lambda/static-analysis-lambda --follow

# Conditional Analysis logs
aws logs tail /aws/lambda/conditional-analysis-lambda --follow
```

### Test Invocation

```bash
# Test Static Analysis
aws lambda invoke \
  --function-name static-analysis-lambda \
  --payload '{"source":"manual.test"}' \
  response.json && cat response.json

# Test Conditional Analysis
aws lambda invoke \
  --function-name conditional-analysis-lambda \
  --payload '{"source":"manual.test"}' \
  response.json && cat response.json
```

---

## 🛠️ Customization

### Change Analysis Questions

Edit `.env`:
```env
STATIC_ANALYSIS_QUESTION=Your custom question for Data1, Data2, Data3?
CONDITIONAL_ANALYSIS_QUESTION=Your custom question for Data5?
```

### Adjust Schedule

```bash
# Change to every 2 hours
aws events put-rule --name static-analysis-trigger --schedule-expression "rate(2 hours)"

# Change to cron (every day at 9 AM UTC)
aws events put-rule --name static-analysis-trigger --schedule-expression "cron(0 9 * * ? *)"
```

### Add More Data Fields

Edit handlers to fetch additional fields:
```javascript
const data7 = apiResponse.data7 || apiResponse.Data7;
```

---

## 🐛 Troubleshooting

### Lambda Timeout
- Increase timeout: `--timeout 90`
- Check API response time
- Reduce OpenAI max_tokens

### API Connection Failed
- Verify REST_API_URL
- Check API authentication
- Ensure Lambda has internet access

### OpenAI Error
- Verify API key
- Check Sumopod AI status
- Monitor token limits

### Data Not Updated
- Check API POST endpoint
- Verify payload format
- Check API logs

---

## 💡 Best Practices

1. **API Design** - Use consistent field naming (data1 or Data1)
2. **Error Handling** - Monitor CloudWatch for failures
3. **Cost Optimization** - Adjust schedule frequency
4. **Security** - Use AWS Secrets Manager for API keys
5. **Testing** - Always test locally before deploying

---

## 📄 License

ISC

---

**Created for AWS Lambda Automation + OpenAI Integration**  
**Version:** 2.0  
**Last Updated:** 2025-10-07
