// Layer 1 integration test — runs the real compiled engine against fixtures.
// Build first:  npx tsc --outDir /tmp/redactor-build --module commonjs --target es2020 \
//                 --esModuleInterop --skipLibCheck --noEmit false \
//                 src/types.ts src/engine/*.ts

const { redact, patterns } = require("/tmp/redactor-build/engine");
const { luhn, iban, vin, ssn } = require("/tmp/redactor-build/engine/validators");

let passed = 0;
let failed = 0;
const failures = [];

function assert(name, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function detect(text, policy = "enhanced") {
  return redact(text, "typed", policy, []).detections;
}
function hits(text, policy, type) {
  return detect(text, policy).filter((d) => d.type === type);
}

// ---------------------------------------------------------------- VALIDATORS
section("Validators");
assert("luhn accepts 4539 1488 0343 6467", luhn("4539 1488 0343 6467"));
assert("luhn rejects 4539 1488 0343 6468", !luhn("4539 1488 0343 6468"));
assert("luhn rejects too short", !luhn("123"));
assert(
  "iban accepts DE89370400440532013000",
  iban("DE89370400440532013000")
);
assert("iban rejects DE00370400440532013000", !iban("DE00370400440532013000"));
assert("vin accepts 1HGBH41JXMN109186", vin("1HGBH41JXMN109186"));
assert("vin rejects bad check digit", !vin("1HGBH41J0MN109186"));
assert("vin rejects letters I/O/Q", !vin("1HGBH41JXMN10918I"));
assert("ssn accepts 123-45-6789", ssn("123-45-6789"));
assert("ssn rejects 000-12-3456", !ssn("000-12-3456"));
assert("ssn rejects 666-12-3456", !ssn("666-12-3456"));
assert("ssn rejects 900-12-3456", !ssn("900-12-3456"));
assert("ssn rejects group 00", !ssn("123-00-6789"));
assert("ssn rejects serial 0000", !ssn("123-45-0000"));

// ---------------------------------------------------------------- PATTERNS
section("Pattern coverage (enhanced policy)");

const cases = [
  {
    type: "JWT",
    text:
      "tok=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.dummy_sig_123",
  },
  { type: "AWS_ACCESS_KEY", text: "key AKIAIOSFODNN7EXAMPLE end" },
  {
    type: "GITHUB_PAT",
    text: "pat ghp_1234567890abcdefghijklmnopqrstuvwxyz end",
  },
  {
    type: "STRIPE_KEY",
    text: "sk sk_live_abcdefghijklmnopqrstuvwx end",
  },
  {
    type: "GOOGLE_API_KEY",
    text: "key AIzaSy0123456789abcdefghijklmnopqrstuvw end",
  },
  { type: "PASSWORD_FIELD", text: 'password = "supersecret123"' },
  {
    type: "DATABASE_URL",
    text: "url postgresql://user:pass@db.example.com:5432/app",
  },
  {
    type: "PRIVATE_KEY",
    text:
      "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA\n-----END RSA PRIVATE KEY-----",
  },
  { type: "EMAIL", text: "ping me at john.doe@example.com please" },
  { type: "PHONE_US", text: "call (555) 123-4567 anytime" },
  { type: "SSN", text: "ssn 123-45-6789 ok" },
  { type: "CREDIT_CARD", text: "card 4539 1488 0343 6467 expires" },
  { type: "IBAN", text: "iban DE89 3704 0044 0532 0130 00 done" },
  { type: "BITCOIN_ADDRESS", text: "btc 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2 ok" },
  {
    type: "ETHEREUM_ADDRESS",
    text: "eth 0x32Be343B94f860124dC4fEe278FDCBD38C102D88 end",
  },
  { type: "IPV4", text: "ip 192.168.1.100 here" },
  {
    type: "IPV6",
    text: "v6 2001:0db8:85a3:0000:0000:8a2e:0370:7334 done",
  },
  { type: "MAC_ADDRESS", text: "mac 00:1A:2B:3C:4D:5E ok" },
  { type: "URL", text: "open https://example.com/path?x=1 here" },
  { type: "UUID", text: "id 550e8400-e29b-41d4-a716-446655440000 ok" },
  { type: "UNIX_PATH", text: "open /Users/john/Documents/file.txt now" },
  { type: "WINDOWS_PATH", text: "go C:\\Users\\John\\Docs\\file.txt now" },
  { type: "VIN", text: "vin 1HGBH41JXMN109186 ok" },
];

for (const c of cases) {
  const found = hits(c.text, "enhanced", c.type);
  assert(
    `${c.type}`,
    found.length >= 1,
    found.length === 0 ? `no match in: ${c.text}` : null
  );
}

// Confirm every cataloged pattern was tested.
const tested = new Set(cases.map((c) => c.type));
for (const p of patterns) {
  if (
    !tested.has(p.name) &&
    p.name !== "SESSION_TOKEN" &&
    p.name !== "SWIFT_BIC" &&
    p.name !== "LITECOIN_ADDRESS" &&
    p.name !== "MONERO_ADDRESS"
  ) {
    assert(`pattern ${p.name} included in test suite`, false);
  }
}

// ---------------------------------------------------------------- POLICY BANDS
section("Policy bands");
const banner =
  "email a@b.com card 4539 1488 0343 6467 ip 10.0.0.1 path /etc/hosts";

const sec = detect(banner, "secrets").map((d) => d.type);
assert(
  "secrets policy excludes EMAIL",
  !sec.includes("EMAIL"),
  `got: ${sec.join(",")}`
);
assert(
  "secrets policy excludes CREDIT_CARD",
  !sec.includes("CREDIT_CARD")
);
assert("secrets policy excludes IPV4", !sec.includes("IPV4"));

const bal = detect(banner, "balanced").map((d) => d.type);
assert("balanced policy includes EMAIL", bal.includes("EMAIL"));
assert(
  "balanced policy excludes CREDIT_CARD",
  !bal.includes("CREDIT_CARD")
);
assert("balanced policy excludes IPV4", !bal.includes("IPV4"));

const std = detect(banner, "standard").map((d) => d.type);
assert("standard policy includes CREDIT_CARD", std.includes("CREDIT_CARD"));
assert("standard policy excludes IPV4", !std.includes("IPV4"));

const enh = detect(banner, "enhanced").map((d) => d.type);
assert("enhanced policy includes IPV4", enh.includes("IPV4"));
assert("enhanced policy includes UNIX_PATH", enh.includes("UNIX_PATH"));

// ---------------------------------------------------------------- MODES
section("Redaction modes");
const sample =
  "ping john.doe@example.com or john.doe@example.com on 4539 1488 0343 6467";

const labelOut = redact(sample, "label", "standard", []).text;
assert(
  "label mode replaces with [REDACTED]",
  labelOut.includes("[REDACTED]") &&
    !labelOut.includes("a@b.com") &&
    !labelOut.includes("4539"),
  labelOut
);

const typedOut = redact(sample, "typed", "standard", []).text;
assert(
  "typed mode tags by type",
  typedOut.includes("[EMAIL_REDACTED]") &&
    typedOut.includes("[CREDIT_CARD_REDACTED]"),
  typedOut
);

const indexedOut = redact(sample, "indexed", "standard", []).text;
assert(
  "indexed mode reuses index for duplicates",
  (indexedOut.match(/\[EMAIL_1\]/g) || []).length === 2,
  indexedOut
);

const maskedOut = redact(sample, "masked", "standard", []).text;
assert(
  "masked mode preserves last-4 of card",
  maskedOut.includes("****-****-****-6467"),
  maskedOut
);
assert(
  "masked mode partially shows email",
  /\w\*\*\*\w@\*\*\*\.\w+/.test(maskedOut),
  maskedOut
);

// ---------------------------------------------------------------- CHECKSUMS GATE
section("Checksum gating");
const fakeCard = "card 4539 1488 0343 6468"; // bad luhn
assert(
  "invalid Luhn card NOT detected",
  hits(fakeCard, "standard", "CREDIT_CARD").length === 0
);
const fakeIban = "iban DE00 3704 0044 0532 0130 00";
assert(
  "invalid IBAN NOT detected",
  hits(fakeIban, "standard", "IBAN").length === 0
);

// ---------------------------------------------------------------- THREAT FEEDS
section("Threat feeds");
const feedRes = redact(
  "ping evil.example.com over here",
  "typed",
  "secrets",
  [
    {
      id: "f1",
      name: "Bad Domains",
      patterns: ["evil\\.example\\.com"],
      enabled: true,
      created: 0,
      modified: 0,
    },
  ]
);
assert(
  "enabled feed fires",
  feedRes.detections.some((d) => d.type === "MALICIOUS_URL")
);

const disabledFeedRes = redact(
  "ping evil.example.com",
  "typed",
  "secrets",
  [
    {
      id: "f1",
      name: "Bad Domains",
      patterns: ["evil\\.example\\.com"],
      enabled: false,
      created: 0,
      modified: 0,
    },
  ]
);
assert(
  "disabled feed does not fire",
  disabledFeedRes.detections.length === 0
);

const badRegexRes = redact("anything", "typed", "secrets", [
  {
    id: "f2",
    name: "Broken",
    patterns: ["[unterminated"],
    enabled: true,
    created: 0,
    modified: 0,
  },
]);
assert(
  "invalid regex in feed is swallowed (no throw)",
  badRegexRes.detections.length === 0
);

// ---------------------------------------------------------------- WRAPPED JWT
section("Line-wrapped JWT");
const wrappedJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF\n0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const wrappedRes = redact(`tok=${wrappedJwt} done`, "typed", "secrets", []);
const wrappedTypes = wrappedRes.detections.map((d) => d.type);
assert(
  "wrapped JWT detected as a single JWT",
  wrappedTypes.filter((t) => t === "JWT").length === 1,
  `got types: ${wrappedTypes.join(",")}`
);
assert(
  "wrapped JWT does not leak SESSION_TOKEN fragments",
  !wrappedTypes.includes("SESSION_TOKEN"),
  wrappedTypes.join(",")
);
assert(
  "wrapped JWT signature not present in output",
  !wrappedRes.text.includes("SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"),
  wrappedRes.text
);
assert(
  "wrapped JWT payload tail not present in output",
  !wrappedRes.text.includes("0IjoxNTE2MjM5MDIyfQ"),
  wrappedRes.text
);

// ---------------------------------------------------------------- OVERLAPS
section("Overlap resolution");
// JWT contains a long alphanumeric run; SESSION_TOKEN must not double-cover JWT.
const jwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dummysigsXXXXXXXXXXXXXXXXX";
const overlapHits = detect(`tok=${jwt} done`, "secrets");
const jwtSpan = overlapHits.find((d) => d.type === "JWT");
const overlapped = overlapHits.filter(
  (d) => d !== jwtSpan && d.start < jwtSpan.end && d.end > jwtSpan.start
);
assert(
  "JWT span wins over overlapping SESSION_TOKEN",
  jwtSpan && overlapped.length === 0,
  overlapped.map((o) => `${o.type}@${o.start}-${o.end}`).join(",")
);

// ---------------------------------------------------------------- KITCHEN SINK
section("Kitchen-sink document");
const doc = `
From: john.doe@company.com
To: support@vendor.com
Credit Card: 4539 1488 0343 6467
SSN: 123-45-6789
AWS: AKIAIOSFODNN7EXAMPLE
JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
DB: postgresql://user:pass123@db.example.com:5432/mydb
Server: 192.168.1.100
Path: /Users/john/Documents/secret.txt
`.trim();

const result = redact(doc, "typed", "enhanced", []);
const types = new Set(result.detections.map((d) => d.type));
for (const expected of [
  "EMAIL",
  "CREDIT_CARD",
  "SSN",
  "AWS_ACCESS_KEY",
  "JWT",
  "DATABASE_URL",
  "IPV4",
  "UNIX_PATH",
]) {
  assert(`document contains ${expected}`, types.has(expected));
}
assert(
  "redacted output drops original card digits",
  !result.text.includes("4539 1488 0343 6467")
);
assert(
  "redacted output drops original AWS key",
  !result.text.includes("AKIAIOSFODNN7EXAMPLE")
);

// ---------------------------------------------------------------- SUMMARY
console.log(`\n=== Result: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  console.log("\nFailures:");
  for (const f of failures) {
    console.log(`  - ${f.name}${f.detail ? ` — ${f.detail}` : ""}`);
  }
  process.exit(1);
}
