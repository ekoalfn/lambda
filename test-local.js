/**
 * Local testing script for Lambda function
 * Run: node test-local.js
 */

require('dotenv').config();
const handler = require('./index').handler;

// Mock EventBridge event
const mockEvent = {
  version: '0',
  id: 'test-event-id',
  'detail-type': 'Scheduled Event',
  source: 'aws.events',
  account: '123456789012',
  time: new Date().toISOString(),
  region: 'us-east-1',
  resources: ['arn:aws:events:us-east-1:123456789012:rule/lambda-openai-trigger'],
  detail: {}
};

// Mock context
const mockContext = {
  functionName: 'lambda-openai-integration',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:lambda-openai-integration',
  memoryLimitInMB: '256',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/lambda-openai-integration',
  logStreamName: '2025/10/06/[$LATEST]test',
  getRemainingTimeInMillis: () => 30000
};

console.log('🧪 Testing Lambda function locally...\n');

handler(mockEvent, mockContext)
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
