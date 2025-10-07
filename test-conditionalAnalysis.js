/**
 * Local testing script for Conditional Analysis Lambda
 * Run: node test-conditionalAnalysis.js
 */

require('dotenv').config();

// Test Case 1: Data6 is empty (should proceed with analysis)
const mockAPIResponseEmpty = {
  data1: {
    revenue: 500000,
    expenses: 350000,
    quarter: 'Q3'
  },
  data2: {
    customers: 1200,
    churnRate: 5,
    growth: 15
  },
  data3: {
    marketShare: 12,
    competitors: 8,
    industry: 'SaaS'
  },
  data5: {
    targetMetric: 'profit_margin',
    period: 'next_quarter'
  },
  data6: null // Empty - should trigger analysis
};

// Test Case 2: Data6 is NOT empty (should skip analysis)
const mockAPIResponseFilled = {
  ...mockAPIResponseEmpty,
  data6: 'Previous analysis result exists' // Not empty - should skip
};

// Choose which test case to run
const USE_EMPTY_DATA6 = true; // Change to false to test skip scenario

// Mock API Client
class MockAPIClient {
  async fetchData(endpoint) {
    console.log(`[Mock API] Fetching from: ${endpoint}`);
    return USE_EMPTY_DATA6 ? mockAPIResponseEmpty : mockAPIResponseFilled;
  }

  async postData(endpoint, data) {
    console.log(`[Mock API] Posting to: ${endpoint}`);
    console.log('[Mock API] Data:', JSON.stringify(data, null, 2));
    return { success: true, id: 'mock-456' };
  }
}

// Replace real API client with mock
const APIClient = require('./utils/apiClient');
require.cache[require.resolve('./utils/apiClient')].exports = MockAPIClient;

// Load handler
const handler = require('./handlers/conditionalAnalysis').handler;

// Mock EventBridge event
const mockEvent = {
  version: '0',
  id: 'test-event-id',
  'detail-type': 'Scheduled Event',
  source: 'aws.events',
  time: new Date().toISOString()
};

console.log('🧪 Testing Conditional Analysis Lambda locally...');
console.log(`Test Case: Data6 is ${USE_EMPTY_DATA6 ? 'EMPTY' : 'NOT EMPTY'}\n`);

handler(mockEvent)
  .then(result => {
    console.log('\n✅ Test completed successfully!');
    console.log('\n📊 Result:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('\n❌ Test failed!');
    console.error('Error:', error);
    process.exit(1);
  });
