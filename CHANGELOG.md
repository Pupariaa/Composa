# Changelog

## 1.2.0 — 2025-09-11

### CLI Major Overhaul

Complete redesign and enhancement of the Composa CLI for a more professional and user-friendly experience.

#### Added

- **Interactive CLI Setup**: New `npx composa <provider>` command for guided email provider configuration
- **Extended Provider Support**: Added support for AOL, GMX, Zoho, and iCloud email providers
- **Security Warnings**: Built-in security recommendations for production deployments
- **Code Generation**: Automatic generation of ready-to-use code snippets with proper imports
- **File Export**: Option to save generated configuration code to files

#### Changed

- **CLI Executable**: Renamed from `composa-test` to `composa` for consistency
- **File Extension**: Updated CLI script from `.js` to `.mjs` for modern ESM support
- **Professional Design**: Removed all emojis for a cleaner, more professional appearance
- **Unified Branding**: All text and instructions now use consistent "composa" naming
- **Enhanced User Experience**: More intuitive and clear setup instructions

#### Removed

- **Business API Providers**: Removed SendGrid, Mailgun, SES, Postmark, Brevo, Mailjet, SparkPost, Mailtrap, and Ethereal
- **Outlook Support**: Temporarily removed due to Microsoft's SMTP authentication restrictions
- **OAuth2 Complexity**: Simplified Gmail setup to focus on App Passwords instead of OAuth2

#### Security Improvements

- **Environment Variable Recommendations**: All setup functions now include security warnings
- **Best Practices Guidance**: Clear instructions for using `.env` files and `.gitignore`
- **Credential Protection**: Warnings about not committing credentials to version control

#### CLI Commands

```bash
# Setup email providers
npx composa gmail     # Gmail with App Passwords
npx composa yahoo     # Yahoo with App Passwords  
npx composa aol       # AOL with App Passwords
npx composa gmx       # GMX with App Passwords
npx composa zoho      # Zoho with App Passwords
npx composa icloud    # iCloud with App Passwords

# Utility commands
npx composa list      # List all available providers
npx composa help      # Show help information
```

#### Provider-Specific Features

- **Gmail**: Streamlined App Password setup with 2FA guidance
- **Yahoo**: App Password setup with account restriction warnings
- **AOL**: Complete App Password configuration flow
- **GMX**: Flexible setup supporting both regular passwords and App Passwords
- **Zoho**: Professional email setup with IMAP access requirements
- **iCloud**: Apple ecosystem integration with App Password setup

## 1.0.0 — 2025-08-31

First stable release of Composa: a modern, ESM-first toolkit to compose and send beautiful, multilingual XHTML emails with Nodemailer.

### Highlights

- EmailClient: send templated or raw emails, bulk sending, retries.
- Multilingual XHTML templates: French and English out of the box.
- Provider presets: one-liners for Gmail, Yahoo, AOL, GMX, Zoho, iCloud.
- Simple subject registry with variable interpolation.
- Lightweight template engine with caching and language fallbacks.
- Ready-to-run examples and clear quick-start.

### Added

- Core exports (`src/index.js`):
    - `EmailClient`, `TemplateEngine`, `defaultSubjects`.
    - Provider helpers: `emailProviders`, `getProvider`, `createProviderConfig`, `listProviders`, `getProviderDocs`, `getProviderNotes`, `getProviderSetup`.
    - Shortcuts: `createGmailConfig`, `createYahooConfig`, `createAOLConfig`, `createGMXConfig`, `createZohoConfig`, `createiCloudConfig`.
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
