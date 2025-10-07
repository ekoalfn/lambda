/**
 * Local testing script for Static Analysis Lambda
 * Run: node test-staticAnalysis.js
 */

require('dotenv').config();

// Mock your REST API response
const mockAPIResponse = {
  data1: {
    temperature: 25,
    humidity: 60,
    location: 'Jakarta'
  },
  data2: {
    sales: 150000,
    target: 200000,
    month: 'October'
  },
  data3: {
    inventory: 45,
    reorderLevel: 50,
    product: 'Widget A'
  }
};

// Mock API Client
class MockAPIClient {
  async fetchData(endpoint) {
    console.log(`[Mock API] Fetching from: ${endpoint}`);
    return mockAPIResponse;
  }

  async postData(endpoint, data) {
    console.log(`[Mock API] Posting to: ${endpoint}`);
    console.log('[Mock API] Data:', JSON.stringify(data, null, 2));
    return { success: true, id: 'mock-123' };
  }
}

// Replace real API client with mock
const APIClient = require('./utils/apiClient');
const originalAPIClient = APIClient;
require.cache[require.resolve('./utils/apiClient')].exports = MockAPIClient;

// Load handler
const handler = require('./handlers/staticAnalysis').handler;

// Mock EventBridge event
const mockEvent = {
  version: '0',
  id: 'test-event-id',
  'detail-type': 'Scheduled Event',
  source: 'aws.events',
  time: new Date().toISOString()
};

console.log('🧪 Testing Static Analysis Lambda locally...\n');

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
