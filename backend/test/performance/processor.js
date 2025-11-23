// Artillery processor for generating test data and custom logic

const fs = require('fs');
const path = require('path');

// Sample data for testing
const sampleSentences = [
  'John works at Google in New York City.',
  'The quick brown fox jumps over the lazy dog.',
  'I love programming with TypeScript and Node.js.',
  'Machine learning is transforming the world.',
  'Natural language processing helps computers understand human language.',
  'The weather is beautiful today in San Francisco.',
  'She studies computer science at Stanford University.',
  'The restaurant serves delicious Italian food.',
  'He plays guitar in a local band every weekend.',
  'The conference will be held in Tokyo next month.',
];

const emotions = [
  'happy',
  'sad',
  'excited',
  'angry',
  'calm',
  'nervous',
  'joyful',
  'frustrated',
];

let requestCount = 0;
const maxRequests = 10000;

// Custom variables and functions for Artillery
module.exports = {
  // Generate random sentence for testing
  generateRandomSentence(userContext, events, done) {
    const randomIndex = Math.floor(Math.random() * sampleSentences.length);
    userContext.vars.randomSentence = sampleSentences[randomIndex];
    return done();
  },

  // Generate random emotion for testing
  generateRandomEmotion(userContext, events, done) {
    const randomIndex = Math.floor(Math.random() * emotions.length);
    userContext.vars.randomEmotion = emotions[randomIndex];
    return done();
  },

  // Generate random string for testing
  generateRandomString(userContext, events, done) {
    const length = Math.floor(Math.random() * 50) + 10;
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    userContext.vars.randomString = result;
    return done();
  },

  // Track request count and log periodically
  trackRequest(requestParams, response, context, ee, next) {
    requestCount++;

    // Log every 100 requests
    if (requestCount % 100 === 0) {
      console.log(`Processed ${requestCount} requests`);
    }

    // Log slow requests (>500ms)
    if (response.timings && response.timings.phases) {
      const totalTime = response.timings.phases.total;
      if (totalTime > 500) {
        console.log(`Slow request: ${requestParams.url} took ${totalTime}ms`);
      }
    }

    return next();
  },

  // Custom validation for API responses
  validateResponse(requestParams, response, context, ee, next) {
    // Check if response has expected structure
    if (response.statusCode === 200) {
      try {
        const responseBody = JSON.parse(response.body);

        // Validate sentiment response
        if (
          requestParams.url.includes('/sentiment') &&
          responseBody.sentiment
        ) {
          if (
            !['positive', 'negative', 'neutral'].includes(
              responseBody.sentiment,
            )
          ) {
            console.error(`Invalid sentiment value: ${responseBody.sentiment}`);
          }
        }

        // Validate emotion response
        if (requestParams.url.includes('/emotion') && responseBody.emotion) {
          // Emotion validation would go here
        }

        // Validate NER response
        if (requestParams.url.includes('/ner') && responseBody.entities) {
          if (!Array.isArray(responseBody.entities)) {
            console.error('NER response entities should be an array');
          }
        }

        // Validate translation response
        if (
          requestParams.url.includes('/translate') &&
          responseBody.translated_text
        ) {
          if (
            !responseBody.translated_text ||
            responseBody.translated_text.length === 0
          ) {
            console.error('Translation response should have translated_text');
          }
        }
      } catch (error) {
        console.error(`Failed to parse response JSON: ${error.message}`);
      }
    }

    return next();
  },

  // Setup function called before tests start
  setup(requestParams, context, ee, next) {
    console.log('Starting performance test...');

    // Initialize any global state
    context.vars.startTime = Date.now();

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, '..', '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    return next();
  },

  // Teardown function called after tests complete
  teardown(requestParams, context, ee, next) {
    const duration = Date.now() - context.vars.startTime;
    console.log(`Performance test completed in ${duration}ms`);
    console.log(`Total requests processed: ${requestCount}`);

    // Generate custom report
    const reportPath = path.join(
      __dirname,
      '..',
      '..',
      'reports',
      'custom-performance-report.json',
    );
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      totalRequests: requestCount,
      averageResponseTime: duration / requestCount,
      requestsPerSecond: (requestCount / duration) * 1000,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Custom performance report saved to: ${reportPath}`);

    return next();
  },
};
