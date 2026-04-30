// Basic test to validate the redaction engine works
const { redact } = require('./dist/engine/index.js');

console.log('Testing Secure Redact engine...');

// Test cases as defined in the brief
const testCases = [
  {
    name: "Empty text",
    input: "",
    expected: "clean"
  },
  {
    name: "Plain text with no secrets",
    input: "Hello world, this is just plain text.",
    expected: "clean"
  },
  {
    name: "JWT",
    input: "Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    expected: "redacted"
  },
  {
    name: "AWS Key",
    input: "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE",
    expected: "redacted"
  },
  {
    name: "Credit card (valid Luhn)",
    input: "Card number: 4539 1488 0343 6467",
    expected: "redacted"
  },
  {
    name: "Credit card (invalid Luhn)",
    input: "Card number: 4539 1488 0343 6468",
    expected: "clean"
  },
  {
    name: "Email address",
    input: "Contact: john.doe@company.com",
    expected: "redacted"
  }
];

function runTests() {
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const result = redact(testCase.input, 'typed', 'balanced', []);
      const isClean = result.redactedCount === 0;
      const expectClean = testCase.expected === "clean";

      if (isClean === expectClean) {
        console.log(`✅ ${testCase.name}: PASS`);
        passed++;
      } else {
        console.log(`❌ ${testCase.name}: FAIL - Expected ${testCase.expected}, got ${isClean ? 'clean' : 'redacted'}`);
        console.log(`   Input: "${testCase.input}"`);
        console.log(`   Output: "${result.text}"`);
        console.log(`   Detections: ${result.detections.map(d => d.type).join(', ')}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: ERROR - ${error.message}`);
      failed++;
    }
  }

  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}