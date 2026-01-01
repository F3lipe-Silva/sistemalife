
const main = require('./src/main.js');

// Mock request and response
const req = {
  body: JSON.stringify({ prompt: "Hello, are you working?" })
};

const res = {
  json: (data, statusCode) => {
    console.log('Status Code:', statusCode || 200);
    console.log('Response:', JSON.stringify(data, null, 2));
    return data;
  }
};

const log = console.log;
const error = console.error;

// Set env var for test
process.env.GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENAI_API_KEY || 'TEST_KEY_PLACEHOLDER';

console.log('Running local function test...');
main({ req, res, log, error }).then(() => {
    console.log('Test finished.');
}).catch(err => {
    console.error('Test failed:', err);
});
