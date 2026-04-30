# Secure Redact

**100% offline data redaction for sensitive information.** Secure Redact is a macOS-native Raycast extension that detects 26+ signatures of sensitive data (API keys, JWTs, credit cards, SSNs, IBANs, crypto addresses, IPs, paths, etc.) and rewrites them in one of four modes before you paste into AI tools, GitHub tickets, logs, or emails. Detection is pure regex + checksum validation (Luhn, IBAN mod-97, VIN). **No AI model. No cloud. No telemetry.**

## Commands

| Command           | Description                                         | Recommended Hotkey |
|-------------------|----------------------------------------------------|--------------------|
| Redact Clipboard  | Sanitize clipboard content in place               | ⌥⇧R                |
| Redact & Paste    | Sanitize and paste to active app                  | ⌥⇧V                |
| Open Workbench    | Interactive editor with live preview              | (none)             |
| Audit Log         | View redaction history                             | (none)             |
| Threat Feeds      | Custom pattern management                          | (none)             |
| Settings          | Manage local data                                  | (none)             |

## Detection Coverage

All detection patterns and modes are available with no tier restrictions.

### Secrets
| Pattern           | Description                    | Validator     |
|-------------------|--------------------------------|---------------|
| JWT               | JSON Web Token                 | Structure     |
| AWS_ACCESS_KEY    | AWS Access Key ID              | Format        |
| GITHUB_PAT        | GitHub Personal Access Token  | Format        |
| STRIPE_KEY        | Stripe Secret Key              | Format        |
| GOOGLE_API_KEY    | Google API Key                 | Format        |
| PASSWORD_FIELD    | Password in configuration      | Length        |
| DATABASE_URL      | Database connection string     | Format        |
| PRIVATE_KEY       | PEM private key                | Structure     |
| SESSION_TOKEN     | Generic session token          | Length        |

### Personal
| Pattern           | Description                    | Validator     |
|-------------------|--------------------------------|---------------|
| EMAIL             | Email address                  | Format        |
| PHONE_US          | US phone number                | Format        |
| SSN               | Social Security Number         | Area codes    |

### Financial
| Pattern           | Description                    | Validator     |
|-------------------|--------------------------------|---------------|
| CREDIT_CARD       | Credit card number             | Luhn          |
| IBAN              | International Bank Account     | Mod-97        |
| SWIFT_BIC         | SWIFT/BIC code                 | Format        |
| BITCOIN_ADDRESS   | Bitcoin address                | Checksum      |
| ETHEREUM_ADDRESS  | Ethereum address               | Format        |
| LITECOIN_ADDRESS  | Litecoin address               | Checksum      |
| MONERO_ADDRESS    | Monero address                 | Format        |

### Network & System
| Pattern           | Description                    | Validator     |
|-------------------|--------------------------------|---------------|
| IPV4              | IPv4 address                   | Format        |
| IPV6              | IPv6 address                   | Format        |
| MAC_ADDRESS       | MAC address                    | Format        |
| URL               | HTTP/HTTPS URL                 | Format        |
| UUID              | UUID/GUID                      | Format        |
| UNIX_PATH         | Unix file path                 | Format        |
| WINDOWS_PATH      | Windows file path              | Format        |
| VIN               | Vehicle Identification Number  | Check digit   |

## Privacy

**Secure Redact makes zero network calls and stores no sensitive data.**

### What is stored locally:
- **Audit entries**: `secure-redact.audit.v1` - Redaction statistics only (capped at 500 entries)
- **Threat feeds**: `secure-redact.feeds.v1` - User-defined patterns for custom detection

### What is NEVER stored:
- Original input text or detected values
- Redacted output text or clipboard contents
- File contents, paths, or metadata
- Network activity or browsing history

All data remains on your device in Raycast's LocalStorage. No telemetry, analytics, or external communication.

## Modes

### Label Mode
Replaces all sensitive data with a generic label.

```
Input:  Contact john.doe@company.com for API key AKIAIOSFODNN7EXAMPLE
Output: Contact [REDACTED] for API key [REDACTED]
```

### Typed Mode
Replaces sensitive data with type-specific labels.

```
Input:  Contact john.doe@company.com for API key AKIAIOSFODNN7EXAMPLE
Output: Contact [EMAIL_REDACTED] for API key [AWS_ACCESS_KEY_REDACTED]
```

### Indexed Mode
Maintains referential consistency with numbered labels.

```
Input:  Email john.doe@company.com and cc john.doe@company.com
Output: Email [EMAIL_1] and cc [EMAIL_1]
```

### Masked Mode
Preserves structure while hiding sensitive parts.

```
Input:  Contact john.doe@company.com, card 4539 1488 0343 6467
Output: Contact jo***@***.com, card ****-****-****-6467
```

## Policies

| Policy   | Includes                                                                 |
|----------|--------------------------------------------------------------------------|
| Secrets  | API keys, JWTs, passwords, sessions, DB strings, PEM keys                |
| Balanced | Secrets + emails, phones, SSNs                                           |
| Standard | Balanced + credit cards, IBANs, SWIFT codes, BTC/ETH/LTC/XMR             |
| Enhanced | Standard + IPv4/IPv6, MAC, UUID, URLs, Unix/Windows paths, VIN           |

## Recommended Hotkeys

Configure these shortcuts in Raycast Preferences → Extensions → Secure Redact:

- **⌥⇧R** → Redact Clipboard
- **⌥⇧V** → Redact & Paste

These hotkeys allow instant redaction without opening any UI, perfect for quick data sanitization before sharing.

## Limitations

- **Pattern-based detection has known limits**. Always review output before sharing sensitive content.
- **Not a compliance tool**. GDPR/HIPAA/PCI DSS require additional controls beyond pattern matching.
- **Checksum validation prevents many false positives** but cannot eliminate them entirely.
- **Custom threat feeds** require careful regex construction to avoid performance issues.

## Installation

1. Install via Raycast Store: Search "Secure Redact"
2. Configure hotkeys in Raycast Preferences
3. Start using with clipboard operations or open the Workbench

---

*Built with security and privacy as core principles. No AI models, no cloud dependencies, no data collection.*
