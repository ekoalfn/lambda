# Dynamic Prompt Generation System

## Overview

This system uses **intelligent prompt generation** that is fully dynamic based on REST API data structure analysis. There are no static prompts hardcoded in the code.

## How It Works

### 1. **Data Structure Analysis** (`analyzeDataStructure`)

This function analyzes data received from the API and extracts:

- **Type Detection**: Detects whether data is an Object or Array
- **Key Extraction**: Extracts all fields/keys from the data
- **Value Analysis**: Analyzes the data type of each field (string, number, object, array)
- **Pattern Recognition**: Detects data patterns based on field names:
  - `financial`: price, usd, btc, eth, crypto
  - `weather`: temp, weather, humidity, wind
  - `user_profile`: name, email, user, person, age
  - `content`: title, body, content, post, article
  - `geographic`: country, city, location, capital, region

### 2. **Domain Estimation**

Based on pattern recognition, the system estimates the data domain:
- Financial (cryptocurrency, stocks, prices)
- Weather (weather, temperature)
- User Profile (user data)
- Content (articles, posts, blogs)
- Geographic (countries, cities, locations)
- Unknown (fallback for generic data)

### 3. **Intelligent Instructions** (`generateAnalysisInstructions`)

Each domain has a specific set of analysis instructions:

#### Financial Domain
- Identify all financial metrics and their values
- Provide market insights or trends if applicable
- Highlight significant price movements or values
- Suggest potential implications or context

#### Weather Domain
- Summarize current weather conditions
- Highlight temperature and comfort levels
- Note any extreme conditions or alerts
- Provide practical recommendations if relevant

#### User Profile Domain
- Create a concise profile summary
- Highlight key demographic information
- Note any interesting or unique attributes
- Maintain privacy and professionalism

#### Content Domain
- Identify the main topic or theme
- Extract key messages or points
- Summarize the core content
- Note the tone or style if relevant

#### Geographic Domain
- Provide key facts about the location
- Highlight demographic or geographic data
- Note interesting or notable information
- Provide context or comparisons if helpful

### 4. **Dynamic Prompt Construction** (`generatePrompt`)

The final prompt is built with the following structure:

```
You are an intelligent data analyst. Analyze the following data and provide actionable insights.

CONTEXT:
- Data Type: Object/Array
- Number of Fields: X
- Estimated Domain: [domain]
- API Source: [hostname]

DATA STRUCTURE:
- field1: type
- field2: type (array/nested object)
...

RAW DATA:
{actual JSON data}

ANALYSIS INSTRUCTIONS:
1. [Domain-specific instruction 1]
2. [Domain-specific instruction 2]
3. [Domain-specific instruction 3]
4. [Domain-specific instruction 4]

Provide a clear, structured analysis in 3-4 concise paragraphs. Focus on actionable insights and key takeaways.
```

## System Advantages

### ✅ Fully Dynamic
- No hardcoded prompts
- Adapts to any data structure
- Automatically detects domain and context

### ✅ Intelligent Context
- Provides metadata about the data
- Explains data structure to AI
- Provides relevant instructions

### ✅ Scalable
- Easy to add new domains
- Easy to add pattern recognition
- Easy to customize instructions per domain

### ✅ Efficient
- Structured prompts produce better responses
- Optimal token usage
- More relevant and actionable responses

## Usage Examples

### Example 1: Cryptocurrency Data

**Input Data:**
```json
{
  "bitcoin": { "usd": 125222 },
  "ethereum": { "usd": 4500 }
}
```

**Generated Prompt:**
```
CONTEXT:
- Data Type: Object
- Number of Fields: 2
- Estimated Domain: financial
- API Source: api.coingecko.com

DATA STRUCTURE:
- bitcoin: object (nested object)
- ethereum: object (nested object)

ANALYSIS INSTRUCTIONS:
1. Identify all financial metrics and their values
2. Provide market insights or trends if applicable
3. Highlight significant price movements or values
4. Suggest potential implications or context
```

### Example 2: Blog Post Data

**Input Data:**
```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere...",
  "body": "quia et suscipit..."
}
```

**Generated Prompt:**
```
CONTEXT:
- Data Type: Object
- Number of Fields: 4
- Estimated Domain: content
- API Source: jsonplaceholder.typicode.com

DATA STRUCTURE:
- userId: number
- id: number
- title: string
- body: string

ANALYSIS INSTRUCTIONS:
1. Identify the main topic or theme
2. Extract key messages or points
3. Summarize the core content
4. Note the tone or style if relevant
```

## Customization

### Adding New Domains

Edit the `analyzeDataStructure` function to add pattern detection:

```javascript
if (key.toLowerCase().includes('stock') || key.toLowerCase().includes('ticker')) {
  analysis.dataPatterns.push('stock_market');
}
```

Then add to domain estimation:
```javascript
if (patternCounts['stock_market'] > 0) analysis.estimatedDomain = 'stock_market';
```

### Adding New Instructions

Edit the `generateAnalysisInstructions` function:

```javascript
case 'stock_market':
  instructions.push('Analyze stock performance');
  instructions.push('Identify trends and patterns');
  instructions.push('Provide investment insights');
  instructions.push('Compare with market benchmarks');
  break;
```

## Best Practices

1. **Use consistent APIs** - Consistent data structure produces better analysis
2. **Monitor generated prompts** - Check logs to ensure prompts meet expectations
3. **Adjust max_tokens** - Adjust based on data complexity and analysis needs
4. **Test with various data** - Ensure the system works with different API types

## Performance Tips

- **Limit data size**: If data is too large, take a sample or summary
- **Cache analysis**: For similar data, cache the structure analysis results
- **Optimize token usage**: Adjust instruction length based on needs
- **Use streaming**: For long responses, consider streaming

---

**Created for AWS Lambda + OpenAI Dynamic Integration**
