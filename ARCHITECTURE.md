# Architecture Documentation

## System Overview

This system consists of **2 Lambda functions** that serve as automation scripts to process data from your AWS Serverless REST API, analyze it with OpenAI, and send the results back to the API.

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS EventBridge                          │
│                  (Scheduled Triggers)                       │
└──────────────┬──────────────────────┬───────────────────────┘
               │                      │
               ▼                      ▼
    ┌──────────────────┐   ┌──────────────────────┐
    │  Lambda Script 1 │   │  Lambda Script 2     │
    │ Static Analysis  │   │ Conditional Analysis │
    └────────┬─────────┘   └─────────┬────────────┘
             │                       │
             │  ① Fetch Data         │  ① Fetch Data
             │  ② Analyze with AI    │  ② Check Condition
             │  ③ Post Result        │  ③ Analyze if needed
             │                       │  ④ Post Result
             ▼                       ▼
    ┌───────────────────────────────────────────────┐
    │      Your AWS Serverless REST API             │
    │    (Single Source of Truth)                   │
    │                                               │
    │  Data: Data1, Data2, Data3, Data4,           │
    │        Data5, Data6                          │
    └───────────────────────────────────────────────┘
                       │
                       │ ④ Send Prompt
                       ▼
            ┌─────────────────────┐
            │   OpenAI API        │
            │ (Intelligence Layer)│
            └─────────────────────┘
```

## Components

### 1. **Lambda Script 1: Static Analysis** (`handlers/staticAnalysis.js`)

**Purpose:** Perform static analysis on data and generate actionable tasks.

**Flow:**
1. **Fetch Data** - Retrieve Data1, Data2, Data3 from REST API
2. **Build Prompt** - Generate prompt: "For Data1, Data2, and Data3 what will actionable task?"
3. **Analyze** - Send to OpenAI for analysis
4. **Post Result** - Save result as Data4 to REST API

**Trigger:** EventBridge scheduled event (e.g., every 1 hour)

**Environment Variables:**
```env
REST_API_URL=https://your-api.execute-api.us-east-1.amazonaws.com/prod
FETCH_ENDPOINT=/data
POST_ENDPOINT=/data
STATIC_ANALYSIS_QUESTION=Based on Data1, Data2, and Data3, what are the actionable tasks?
```

**Example Use Case:**
- Data1: Weather conditions
- Data2: Sales data
- Data3: Inventory levels
- → AI generates: "Reorder inventory due to weather forecast affecting supply chain"

---

### 2. **Lambda Script 2: Conditional Analysis** (`handlers/conditionalAnalysis.js`)

**Purpose:** Perform conditional analysis - only if Data6 is empty.

**Flow:**
1. **Fetch Data** - Retrieve Data1, Data2, Data3, Data5, Data6 from REST API
2. **Check Condition** - Check if Data6 is empty
   - **If NOT empty** → Skip (return immediately)
   - **If empty** → Continue to step 3
3. **Build Prompt** - Generate prompt: "For Data1, Data2, and Data3 what will Data5?"
4. **Analyze** - Send to OpenAI for analysis
5. **Post Result** - Save result as Data6 to REST API

**Trigger:** EventBridge scheduled event (e.g., every 30 minutes)

**Environment Variables:**
```env
REST_API_URL=https://your-api.execute-api.us-east-1.amazonaws.com/prod
FETCH_ENDPOINT=/data
POST_ENDPOINT=/data
CONDITIONAL_ANALYSIS_QUESTION=Based on Data1, Data2, and Data3, what will be the result for Data5?
```

**Example Use Case:**
- Data1: Revenue data
- Data2: Customer metrics
- Data3: Market share
- Data5: Target metric (e.g., "profit_margin")
- Data6: Empty (needs calculation)
- → AI generates: "Expected profit margin of 30% based on current trends"

---

## Shared Utilities

### **APIClient** (`utils/apiClient.js`)

Wrapper for communication with your REST API.

**Methods:**
- `fetchData(endpoint, params)` - GET request
- `postData(endpoint, data)` - POST request
- `updateData(endpoint, data)` - PUT request
- `patchData(endpoint, data)` - PATCH request

**Features:**
- Automatic authentication (Bearer token)
- Error handling
- Timeout management (15s)
- Logging

---

### **OpenAIClient** (`utils/openaiClient.js`)

Wrapper for OpenAI API with dynamic prompt generation.

**Methods:**
- `analyzeDataStructure(data)` - Analyze data structure
- `generateAnalysisInstructions(dataAnalysis)` - Generate domain-specific instructions
- `generateCustomPrompt(question, data)` - Build dynamic prompt
- `analyze(prompt, maxTokens)` - Send to OpenAI
- `analyzeWithQuestion(question, data, maxTokens)` - Complete analysis flow

**Features:**
- Dynamic prompt generation
- Domain detection (financial, weather, content, etc.)
- Intelligent context building
- Retry logic (3 attempts)
- Timeout management (30s)

---

## Data Flow Examples

### Example 1: Static Analysis

**Input from API:**
```json
{
  "data1": { "temperature": 25, "humidity": 60 },
  "data2": { "sales": 150000, "target": 200000 },
  "data3": { "inventory": 45, "reorderLevel": 50 }
}
```

**Generated Prompt:**
```
You are an intelligent data analyst. Answer the following question based on the provided data.

QUESTION:
Based on Data1, Data2, and Data3, what are the actionable tasks that should be performed?

CONTEXT:
Data Type: Object
Number of Fields: 3
Estimated Domain: unknown

DATA STRUCTURE:
  - Data1: object (nested object)
  - Data2: object (nested object)
  - Data3: object (nested object)

RAW DATA:
{
  "Data1": { "temperature": 25, "humidity": 60 },
  "Data2": { "sales": 150000, "target": 200000 },
  "Data3": { "inventory": 45, "reorderLevel": 50 }
}

Provide a clear, actionable answer. Be specific and concise. Focus on practical insights.
```

**OpenAI Response (Data4):**
```
Based on the provided data, here are the actionable tasks:

1. Inventory Reorder: The inventory level (45) is below the reorder level (50). Immediate action is needed to reorder stock to prevent stockouts.

2. Sales Target Gap: Current sales (150,000) are 25% below target (200,000). Implement promotional campaigns or sales initiatives to close the gap.

3. Weather Consideration: Moderate temperature and humidity levels are favorable for operations. No immediate weather-related actions needed.
```

**Posted to API:**
```json
{
  "data4": "Based on the provided data, here are the actionable tasks...",
  "metadata": {
    "processedAt": "2025-10-07T10:30:00.000Z",
    "source": "static-analysis-lambda",
    "inputData": {
      "data1": { "temperature": 25, "humidity": 60 },
      "data2": { "sales": 150000, "target": 200000 },
      "data3": { "inventory": 45, "reorderLevel": 50 }
    }
  }
}
```

---

### Example 2: Conditional Analysis (Data6 Empty)

**Input from API:**
```json
{
  "data1": { "revenue": 500000, "expenses": 350000 },
  "data2": { "customers": 1200, "churnRate": 5 },
  "data3": { "marketShare": 12, "competitors": 8 },
  "data5": { "targetMetric": "profit_margin", "period": "next_quarter" },
  "data6": null
}
```

**Condition Check:** Data6 is empty → Proceed with analysis

**OpenAI Response (Data6):**
```
Based on the current data, the projected profit margin for next quarter is approximately 30%. 

This is calculated from:
- Current profit margin: (500,000 - 350,000) / 500,000 = 30%
- Low churn rate (5%) indicates stable customer base
- Market share of 12% with 8 competitors suggests room for growth

Recommendation: Maintain current operational efficiency while exploring growth opportunities to increase market share.
```

---

### Example 3: Conditional Analysis (Data6 NOT Empty)

**Input from API:**
```json
{
  "data1": { "revenue": 500000, "expenses": 350000 },
  "data2": { "customers": 1200, "churnRate": 5 },
  "data3": { "marketShare": 12, "competitors": 8 },
  "data5": { "targetMetric": "profit_margin", "period": "next_quarter" },
  "data6": "Previous analysis: 30% profit margin expected"
}
```

**Condition Check:** Data6 is NOT empty → Skip analysis

**Response:**
```json
{
  "statusCode": 200,
  "body": {
    "message": "Data6 already exists. Analysis skipped.",
    "data6": "Previous analysis: 30% profit margin expected",
    "skipped": true,
    "timestamp": "2025-10-07T10:30:00.000Z"
  }
}
```

---

## Deployment

### Deploy Static Analysis Lambda

```bash
# Package function
cd handlers
zip -r ../static-analysis.zip staticAnalysis.js ../utils/ ../node_modules/

# Deploy to AWS
aws lambda create-function \
  --function-name static-analysis-lambda \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler handlers/staticAnalysis.handler \
  --zip-file fileb://static-analysis.zip \
  --timeout 60 \
  --memory-size 512 \
  --environment Variables="{OPENAI_API_KEY=sk-xxx,REST_API_URL=https://your-api.com}"
```

### Deploy Conditional Analysis Lambda

```bash
# Package function
zip -r conditional-analysis.zip handlers/conditionalAnalysis.js utils/ node_modules/

# Deploy to AWS
aws lambda create-function \
  --function-name conditional-analysis-lambda \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler handlers/conditionalAnalysis.handler \
  --zip-file fileb://conditional-analysis.zip \
  --timeout 60 \
  --memory-size 512 \
  --environment Variables="{OPENAI_API_KEY=sk-xxx,REST_API_URL=https://your-api.com}"
```

### Setup EventBridge Triggers

```bash
# Static Analysis - Every 1 hour
aws events put-rule \
  --name static-analysis-trigger \
  --schedule-expression "rate(1 hour)"

aws events put-targets \
  --rule static-analysis-trigger \
  --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT_ID:function:static-analysis-lambda"

# Conditional Analysis - Every 30 minutes
aws events put-rule \
  --name conditional-analysis-trigger \
  --schedule-expression "rate(30 minutes)"

aws events put-targets \
  --rule conditional-analysis-trigger \
  --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT_ID:function:conditional-analysis-lambda"
```

---

## Testing

### Local Testing

```bash
# Test Static Analysis
node test-staticAnalysis.js

# Test Conditional Analysis (Data6 empty)
node test-conditionalAnalysis.js

# Test Conditional Analysis (Data6 not empty)
# Edit test-conditionalAnalysis.js: USE_EMPTY_DATA6 = false
node test-conditionalAnalysis.js
```

### AWS Testing

```bash
# Invoke Static Analysis
aws lambda invoke \
  --function-name static-analysis-lambda \
  --payload '{"source":"manual.test"}' \
  response.json

# Invoke Conditional Analysis
aws lambda invoke \
  --function-name conditional-analysis-lambda \
  --payload '{"source":"manual.test"}' \
  response.json
```

---

## Best Practices

### 1. **API Design**
- Use consistent naming (data1, data2, or Data1, Data2)
- Return all required fields in one endpoint
- Implement proper authentication

### 2. **Error Handling**
- Lambda will return error response if API fails
- Monitor CloudWatch logs for debugging
- Implement retry logic at API level if needed

### 3. **Cost Optimization**
- Adjust schedule based on needs (don't run too frequently)
- Set appropriate timeout (60s recommended)
- Monitor OpenAI token usage

### 4. **Security**
- Store API keys in AWS Secrets Manager
- Use IAM roles with least privilege
- Enable VPC if API is private

### 5. **Monitoring**
- Setup CloudWatch alarms for failures
- Track execution duration
- Monitor API response times

---

## Troubleshooting

### Lambda Timeout
- Increase timeout setting
- Check API response time
- Optimize OpenAI max_tokens

### API Connection Failed
- Verify REST_API_URL is correct
- Check API authentication
- Ensure Lambda has internet access (NAT Gateway if in VPC)

### OpenAI Error
- Verify API key is valid
- Check token limits
- Monitor rate limits

### Data6 Not Being Updated
- Check if Data6 is truly empty in API
- Verify POST_ENDPOINT is correct
- Check API logs for POST failures

---

**Architecture Version:** 1.0  
**Last Updated:** 2025-10-07
