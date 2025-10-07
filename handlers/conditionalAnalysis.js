const APIClient = require('../utils/apiClient');
const OpenAIClient = require('../utils/openaiClient');

/**
 * Lambda Handler: Conditional Analysis (Script 2)
 * 
 * Flow:
 * 1. Fetch Data1, Data2, Data3, Data5, Data6 from your REST API
 * 2. Check if Data6 is empty:
 *    - If NOT empty → skip (do nothing)
 *    - If empty → continue to step 3
 * 3. Build prompt: "For Data1, Data2, and Data3 what will Data5?"
 * 4. Send to OpenAI → get result
 * 5. Post back result to API as Data6
 */
exports.handler = async (event) => {
  console.log('=== Conditional Analysis Script Started ===');
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

    // Step 1: Fetch Data1, Data2, Data3, Data5, Data6 from your REST API
    console.log('\n[Step 1] Fetching data from REST API...');
    
    const fetchEndpoint = process.env.FETCH_ENDPOINT || '/data';
    const apiResponse = await apiClient.fetchData(fetchEndpoint);
    
    // Extract data fields (support both lowercase and uppercase)
    const data1 = apiResponse.data1 || apiResponse.Data1;
    const data2 = apiResponse.data2 || apiResponse.Data2;
    const data3 = apiResponse.data3 || apiResponse.Data3;
    const data5 = apiResponse.data5 || apiResponse.Data5;
    const data6 = apiResponse.data6 || apiResponse.Data6;

    if (!data1 || !data2 || !data3 || !data5) {
      throw new Error('Missing required data fields (Data1, Data2, Data3, Data5) from API response');
    }

    console.log('Data1:', data1);
    console.log('Data2:', data2);
    console.log('Data3:', data3);
    console.log('Data5:', data5);
    console.log('Data6:', data6);

    // Step 2: Check if Data6 is empty
    console.log('\n[Step 2] Checking if Data6 is empty...');
    
    const isData6Empty = !data6 || 
                         data6 === '' || 
                         data6 === null || 
                         data6 === undefined ||
                         (typeof data6 === 'object' && Object.keys(data6).length === 0) ||
                         (Array.isArray(data6) && data6.length === 0);

    if (!isData6Empty) {
      console.log('Data6 is NOT empty. Skipping analysis.');
      return {
        statusCode: 200,
        body: {
          message: 'Data6 already exists. Analysis skipped.',
          data6: data6,
          skipped: true,
          timestamp: new Date().toISOString()
        }
      };
    }

    console.log('Data6 is empty. Proceeding with analysis...');

    // Step 3: Build prompt and send to OpenAI
    console.log('\n[Step 3] Building prompt and sending to OpenAI...');
    
    const combinedData = {
      Data1: data1,
      Data2: data2,
      Data3: data3,
      Data5: data5
    };

    // Build dynamic question based on Data5
    const question = process.env.CONDITIONAL_ANALYSIS_QUESTION || 
      `Based on Data1, Data2, and Data3, what will be the result for Data5 (${JSON.stringify(data5)})?`;

    const openaiResult = await openaiClient.analyzeWithQuestion(
      question,
      combinedData,
      parseInt(process.env.MAX_TOKENS || '400')
    );

    // Step 4: Post back result as Data6
    console.log('\n[Step 4] Posting result back to API as Data6...');
    
    const postEndpoint = process.env.POST_ENDPOINT || '/data';
    const postPayload = {
      data6: openaiResult,
      Data6: openaiResult, // Support both naming conventions
      metadata: {
        processedAt: new Date().toISOString(),
        source: 'conditional-analysis-lambda',
        inputData: {
          data1: data1,
          data2: data2,
          data3: data3,
          data5: data5
        },
        wasEmpty: true
      }
    };

    const postResult = await apiClient.postData(postEndpoint, postPayload);

    // Return success response
    const result = {
      statusCode: 200,
      body: {
        message: 'Conditional analysis completed successfully',
        data6: openaiResult,
        apiPostResult: postResult,
        timestamp: new Date().toISOString()
      }
    };

    console.log('\n=== Conditional Analysis Script Completed ===');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    return result;

  } catch (error) {
    console.error('\n=== Conditional Analysis Script Failed ===');
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: {
        message: 'Conditional analysis failed',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
};
