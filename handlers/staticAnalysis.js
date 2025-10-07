const APIClient = require('../utils/apiClient');
const OpenAIClient = require('../utils/openaiClient');

/**
 * Lambda Handler: Static Analysis (Script 1)
 * 
 * Flow:
 * 1. Fetch Data1, Data2, Data3 from your REST API
 * 2. Build prompt: "For Data1, Data2, and Data3 what will actionable task?"
 * 3. Send to OpenAI → get result
 * 4. Post back result to API as Data4
 */
exports.handler = async (event) => {
  console.log('=== Static Analysis Script Started ===');
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Initialize clients
    const apiClient = new APIClient(
      process.env.REST_API_URL,
      process.env.REST_API_KEY
    );

    const openaiClient = new OpenAIClient(
      process.env.OPENAI_API_KEY,
      process.env.OPENAI_BASE_URL,
      process.env.OPENAI_MODEL || 'gpt-4o-mini'
    );

    // Step 1: Fetch Data1, Data2, Data3 from your REST API
    console.log('\n[Step 1] Fetching data from REST API...');
    
    const fetchEndpoint = process.env.FETCH_ENDPOINT || '/data';
    const apiResponse = await apiClient.fetchData(fetchEndpoint);
    
    // Extract Data1, Data2, Data3 from response
    const data1 = apiResponse.data1 || apiResponse.Data1;
    const data2 = apiResponse.data2 || apiResponse.Data2;
    const data3 = apiResponse.data3 || apiResponse.Data3;

    if (!data1 || !data2 || !data3) {
      throw new Error('Missing required data fields (Data1, Data2, Data3) from API response');
    }

    console.log('Data1:', data1);
    console.log('Data2:', data2);
    console.log('Data3:', data3);

    // Step 2: Build prompt and send to OpenAI
    console.log('\n[Step 2] Building prompt and sending to OpenAI...');
    
    const combinedData = {
      Data1: data1,
      Data2: data2,
      Data3: data3
    };

    const question = process.env.STATIC_ANALYSIS_QUESTION || 
      'Based on Data1, Data2, and Data3, what are the actionable tasks that should be performed?';

    const openaiResult = await openaiClient.analyzeWithQuestion(
      question,
      combinedData,
      parseInt(process.env.MAX_TOKENS || '400')
    );

    // Step 3: Post back result as Data4
    console.log('\n[Step 3] Posting result back to API as Data4...');
    
    const postEndpoint = process.env.POST_ENDPOINT || '/data';
    const postPayload = {
      data4: openaiResult,
      Data4: openaiResult, // Support both naming conventions
      metadata: {
        processedAt: new Date().toISOString(),
        source: 'static-analysis-lambda',
        inputData: {
          data1: data1,
          data2: data2,
          data3: data3
        }
      }
    };

    const postResult = await apiClient.postData(postEndpoint, postPayload);

    // Return success response
    const result = {
      statusCode: 200,
      body: {
        message: 'Static analysis completed successfully',
        data4: openaiResult,
        apiPostResult: postResult,
        timestamp: new Date().toISOString()
      }
    };

    console.log('\n=== Static Analysis Script Completed ===');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    return result;

  } catch (error) {
    console.error('\n=== Static Analysis Script Failed ===');
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: {
        message: 'Static analysis failed',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
};
