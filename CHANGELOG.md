# Changelog

## 1.0.0 — 2025-08-31

First stable release of Composa: a modern, ESM-first toolkit to compose and send beautiful, multilingual XHTML emails with Nodemailer.

### Highlights

- EmailClient: send templated or raw emails, bulk sending, retries.
- Multilingual XHTML templates: French and English out of the box.
- Provider presets: one-liners for Gmail, Outlook, Yahoo, SendGrid, Mailgun, Ethereal.
- Simple subject registry with variable interpolation.
- Lightweight template engine with caching and language fallbacks.
- Ready-to-run examples and clear quick-start.

### Added

- Core exports (`src/index.js`):
    - `EmailClient`, `TemplateEngine`, `defaultSubjects`.
    - Provider helpers: `emailProviders`, `getProvider`, `createProviderConfig`, `listProviders`, `getProviderDocs`, `getProviderNotes`, `getProviderSetup`.
    - Shortcuts: `createGmailConfig`, `createOutlookConfig`, `createYahooConfig`, `createSendGridConfig`, `createMailgunConfig`, `createTestConfig`.
- Email client (`src/email-client.js`):
    - `send`, `sendBulk`, `sendWithRetry`, `sendTemplate`.
    - Diagnostics: `verifyConnection`, `testConfiguration`.
    - Env-based transport via `transportFromEnv()` with optional DKIM.
- Template engine (`src/template-engine.js`):
    - File-based loader with cache and in-memory registration.
    - `render()` and `replaceVariables()` with sensible defaults (APP_NAME, SUPPORT_EMAIL, etc.).
    - Language fallbacks (e.g., `en` → `en-EN`).
- Built-in multilingual templates (`templates/`):
    - `password-reset`, `account-creation`, `suspicious-login`, `subscription-confirmation`, `newsletter-promotion`, `scheduled-maintenance`.
    - Available in `fr-FR/` and `en-EN/`.
- Examples (`examples/`): basic and advanced usage.

### Requirements

- Node.js >= 18
- Peer dependency: `nodemailer` ^6 (installed automatically via dependencies)

### Install

```bash
npm install composa
```

### Quick Start

```js
import { EmailClient, defaultSubjects, createGmailConfig } from "composa";

const mailer = new EmailClient({
	defaultLang: "en",
	subjects: defaultSubjects,
	transport: createGmailConfig("your@gmail.com", "your-app-password"),
});

await mailer.sendTemplate({
	to: "user@example.com",
	template: "password-reset",
	lang: "en",
	variables: {
		USER_NAME: "Jane Doe",
		RESET_URL: "https://yourapp.com/reset/abcd",
		EXPIRATION_TIME: "24 hours",
	},
});
```

### Notes

- All APIs are ESM-friendly; import using `import ... from 'composa'`.
- You can override templates and subjects or register your own.
- See `README.md` and `TEMPLATES.md` for full documentation.

### Links

- Repository: https://github.com/puparia/composa
- Issues: https://github.com/puparia/composa/issues
