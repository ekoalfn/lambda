const axios = require('axios');
const OpenAI = require('openai');

// Initialize OpenAI client with Sumopod API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://ai.sumopod.com/v1',
  maxRetries: 3,
  timeout: 30000 // 30 seconds
});

/**
 * Generate dynamic prompt based on data type and API URL
 */
function generatePrompt(data, apiUrl) {
  const dataStr = JSON.stringify(data, null, 2);
  
  // Detect data type and create appropriate prompt
  
  // Cryptocurrency price data
  if (apiUrl.includes('coingecko') || apiUrl.includes('crypto')) {
    const coins = Object.keys(data);
    return `Analyze the following cryptocurrency price data and provide insights:

${dataStr}

Please provide:
1. Current price summary
2. Brief market analysis
3. Notable observations

Keep the response concise and informative.`;
  }
  
  // Weather data
  if (apiUrl.includes('weather') || apiUrl.includes('openweathermap')) {
    return `Analyze the following weather data and provide a summary:

${dataStr}

Please provide:
1. Current weather conditions
2. Temperature and feels like
3. Any weather alerts or notable conditions

Keep the response concise.`;
  }
  
  // User/People data
  if (apiUrl.includes('randomuser') || apiUrl.includes('user')) {
    return `Analyze the following user data and create a brief profile summary:

${dataStr}

Provide a concise summary of the user information.`;
  }
  
  // Blog post or content data
  if (apiUrl.includes('jsonplaceholder') || apiUrl.includes('post') || data.title || data.body) {
    return `Analyze the following post/content data:

${dataStr}

Please provide:
1. Main topic or theme
2. Key points or message
3. Brief summary

Keep the response concise.`;
  }
  
  // Country/Geographic data
  if (apiUrl.includes('restcountries') || apiUrl.includes('country')) {
    return `Analyze the following country/geographic data and provide key highlights:

${dataStr}

Provide interesting facts and key information about this location.`;
  }
  
  // Generic data - fallback
  return `Analyze and summarize the following data:

${dataStr}

Please provide:
1. Data type and structure
2. Key information or values
3. Brief insights or observations

Keep the response clear and concise.`;
}

/**
 * AWS Lambda Handler
 * Triggered by EventBridge, fetches data from REST API, and processes with OpenAI
 */
exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    // 1. Fetch data from REST API
    const apiUrl = process.env.REST_API_URL || 'https://jsonplaceholder.typicode.com/posts/1';
    console.log('Fetching data from:', apiUrl);
    
    const apiResponse = await axios.get(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        // Add custom headers if needed
        ...(process.env.API_KEY && { 'Authorization': `Bearer ${process.env.API_KEY}` })
      },
      timeout: 10000 // 10 seconds timeout
    });
    
    console.log('API Response received:', apiResponse.data);
    
    // 2. Generate dynamic prompt based on data type
    const prompt = generatePrompt(apiResponse.data, apiUrl);
    console.log('Generated prompt:', prompt);
    
    // 3. Process data with OpenAI
    console.log('Sending data to OpenAI for processing...');
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });
    
    const openaiResponse = completion.choices[0].message.content;
    console.log('OpenAI Response:', openaiResponse);
    
    // 3. Prepare response
    const result = {
      statusCode: 200,
      body: {
        message: 'Successfully processed data',
        apiData: apiResponse.data,
        openaiAnalysis: openaiResponse,
        timestamp: new Date().toISOString(),
        eventDetails: {
          source: event.source,
          time: event.time
        }
      }
    };
    
    console.log('Lambda execution completed successfully');
    return result;
    
  } catch (error) {
    console.error('Error occurred:', error);
    
    // Handle different error types
    let errorMessage = 'An error occurred';
    let errorDetails = error.message;
    
    if (error.response) {
      // API request error
      errorMessage = 'REST API request failed';
      errorDetails = {
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'API request timeout';
    } else if (error.name === 'OpenAIError') {
      errorMessage = 'OpenAI API error';
    }
    
    return {
      statusCode: 500,
      body: {
        message: errorMessage,
        error: errorDetails,
        timestamp: new Date().toISOString()
      }
    };
  }
};
