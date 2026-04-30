// Test the core engine functionality without TypeScript

// Manual test of patterns and validators
function testLuhn() {
  function luhn(value) {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let alternate = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (alternate) {
        digit *= 2;
        if (digit > 9) digit = (digit % 10) + 1;
      }

      sum += digit;
      alternate = !alternate;
    }

    return sum % 10 === 0;
  }

  // Test cases
  const validCard = "4539 1488 0343 6467";
  const invalidCard = "4539 1488 0343 6468";

  console.log("Testing Luhn algorithm:");
  console.log(`Valid card ${validCard}: ${luhn(validCard) ? 'PASS' : 'FAIL'}`);
  console.log(`Invalid card ${invalidCard}: ${luhn(invalidCard) ? 'FAIL' : 'PASS'}`);

  return luhn(validCard) && !luhn(invalidCard);
}

function testEmailPattern() {
  const pattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const testText = "Contact john.doe@company.com for support";
  const matches = testText.match(pattern);

  console.log("Testing email pattern:");
  console.log(`Text: "${testText}"`);
  console.log(`Matches: ${matches ? matches.join(', ') : 'none'}`);

  return matches && matches.length === 1 && matches[0] === "john.doe@company.com";
}

function testJWTPattern() {
  const pattern = /\beyJ[A-Za-z0-9_-]{2,}\.eyJ[A-Za-z0-9_-]{2,}\.[A-Za-z0-9_-]{2,}/g;
  const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  const testText = `Token: ${jwt}`;
  const matches = testText.match(pattern);

  console.log("Testing JWT pattern:");
  console.log(`Matches: ${matches ? matches.join(', ') : 'none'}`);

  return matches && matches.length === 1 && matches[0] === jwt;
}

function testRedaction() {
  const text = "Email: john@example.com, Card: 4539 1488 0343 6467";

  // Simple redaction test
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const redacted = text.replace(emailPattern, '[EMAIL_REDACTED]');

  console.log("Testing redaction:");
  console.log(`Original: "${text}"`);
  console.log(`Redacted: "${redacted}"`);

  return redacted.includes('[EMAIL_REDACTED]') && !redacted.includes('john@example.com');
}

function runAllTests() {
  console.log("=== Secure Redact Engine Test ===\n");

  let passed = 0;
  let total = 0;

  const tests = [
    { name: "Luhn Algorithm", test: testLuhn },
    { name: "Email Pattern", test: testEmailPattern },
    { name: "JWT Pattern", test: testJWTPattern },
    { name: "Redaction Logic", test: testRedaction }
  ];

  for (const { name, test } of tests) {
    total++;
    try {
      const result = test();
      if (result) {
        console.log(`✅ ${name}: PASS\n`);
        passed++;
      } else {
        console.log(`❌ ${name}: FAIL\n`);
      }
    } catch (error) {
      console.log(`❌ ${name}: ERROR - ${error.message}\n`);
    }
  }

  console.log(`\n=== Test Summary ===`);
  console.log(`Total: ${total}, Passed: ${passed}, Failed: ${total - passed}`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

  return passed === total;
}

// Run tests
runAllTests();