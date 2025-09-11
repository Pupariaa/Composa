# 🎨 Composa

[![npm version](https://badge.fury.io/js/composa.svg)](https://badge.fury.io/js/composa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Compose beautiful multilingual emails with XHTML templates and Nodemailer integration. **Full TypeScript support included!**

## Features

- **Multilingual Support** - Built-in French and English templates
- **Professional Templates** - Pre-designed XHTML email templates
- **Easy Configuration** - Simple setup with Nodemailer
- **Interactive CLI** - Guided setup for email providers with step-by-step instructions
- **Multiple Providers** - Support for Gmail, Yahoo, AOL, GMX, Zoho, iCloud, Outlook, SendGrid, Mailgun
- **Template Engine** - Variable interpolation and conditional rendering
- **Ready-to-use** - Pre-built templates for common use cases
- **Modern ESM** - ES modules with async/await support
- **Component-based Flow** - Compose templates like components (compileTemplate → compileMail → sendMail)
- **Security First** - Built-in warnings and best practices for credential management
- **TypeScript Support** - Full type definitions with IntelliSense and compile-time checking

## Available Templates

| Template                    | French | English | Use Case                 |
| --------------------------- | ------ | ------- | ------------------------ |
| `password-reset`            | ✅     | ✅      | Password reset emails    |
| `account-creation`          | ✅     | ✅      | Welcome new users        |
| `suspicious-login`          | ✅     | ✅      | Security alerts          |
| `subscription-confirmation` | ✅     | ✅      | Newsletter subscriptions |
| `newsletter-promotion`      | ✅     | ✅      | Marketing campaigns      |
| `scheduled-maintenance`     | ✅     | ✅      | System notifications     |

## Quick Start

### Installation

```bash
npm install composa
```

### JavaScript Usage

```javascript
import { EmailClient, defaultSubjects, createGmailConfig } from "composa";

const mailer = new EmailClient({
  defaultLang: "fr",
  subjects: defaultSubjects,
  transport: createGmailConfig("your-email@gmail.com", "your-app-password"),
});

// New flow: compileMail → sendMail
const { html, subject } = mailer.compileMail("password-reset", {
  lang: "fr",
  variables: {
    USER_NAME: "Jean Dupont",
    USER_EMAIL: "user@example.com",
    RESET_URL: "https://yourapp.com/reset/token123",
    EXPIRATION_TIME: "24 heures",
  },
});

const result = await mailer.sendMail({
  to: "user@example.com",
  html,
  subject,
});

console.log("Email sent:", result);
```

### TypeScript Usage

```typescript
import { EmailClient, createGmailConfig, type EmailClientOptions, type MailOptions } from "composa";

const options: EmailClientOptions = {
  defaultLang: "fr",
  defaultFrom: "noreply@myapp.com",
  transport: createGmailConfig("your-email@gmail.com", "your-app-password"),
};

const mailer = new EmailClient(options);

const mailOptions: MailOptions = {
  to: "user@example.com",
  subject: "Welcome!",
  html: "<h1>Welcome to our app!</h1>"
};

const result = await mailer.send(mailOptions);
```

> **TypeScript Support**: Composa includes full TypeScript definitions with IntelliSense, compile-time checking, and type safety. See [TYPESCRIPT.md](TYPESCRIPT.md) for detailed TypeScript usage examples.

## Component-based Flow

Composa uses a component-like approach where you can compose templates step by step:

### Flow Overview

1. **`compileTemplate`** - Compile individual templates (like components)
2. **`compileMail`** - Combine templates into a complete email (HTML + subject)
3. **`sendMail`** - Send the final composed email

### Advanced Example - Template Composition

```javascript
// Compile individual components
const headerHtml = mailer.compileTemplate("email-header", {
  variables: { APP_NAME: "MyApp", USER_NAME: "John" },
});

const itemListHtml = items
  .map((item) =>
    mailer.compileTemplate("list-item", {
      variables: { NAME: item.name, PRICE: item.price },
    }),
  )
  .join("");

// Compose the main email
const { html, subject } = mailer.compileMail("newsletter", {
  variables: {
    HEADER: headerHtml,
    ITEM_LIST: `<ul>${itemListHtml}</ul>`,
    FOOTER: mailer.compileTemplate("email-footer", {}),
  },
});

// Send the composed email
await mailer.sendMail({ to: "user@example.com", html, subject });
```

## Email Providers

Composa supports multiple email providers with easy configuration:

### Gmail Configuration

```javascript
import { createGmailConfig } from "composa";

const gmailConfig = createGmailConfig("your-email@gmail.com", "your-app-password");
const mailer = new EmailClient({ transport: gmailConfig });
```

**Setup Steps:**
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account settings > Security > 2-Step Verification
3. Generate an 'App Password' for 'Mail'
4. Use your Gmail address and the App Password (not your regular password)

### Other Providers

```javascript
import { 
  createYahooConfig, 
  createOutlookConfig,
  createSendGridConfig,
  createMailgunConfig,
  createAOLConfig,
  createGMXConfig,
  createZohoConfig,
  createiCloudConfig
} from "composa";

// Yahoo (requires App Password)
const yahoo = createYahooConfig("your-email@yahoo.com", "your-app-password");

// Outlook
const outlook = createOutlookConfig("your-email@outlook.com", "your-password");

// SendGrid
const sendgrid = createSendGridConfig("your-sendgrid-api-key");

// Mailgun
const mailgun = createMailgunConfig("your-mailgun-api-key", "your-domain");

// AOL (requires App Password)
const aol = createAOLConfig("your-email@aol.com", "your-app-password");

// GMX
const gmx = createGMXConfig("your-email@gmx.com", "your-password");

// Zoho
const zoho = createZohoConfig("your-email@zoho.com", "your-password");

// iCloud (requires App Password)
const icloud = createiCloudConfig("your-email@icloud.com", "your-app-password");
```

## Advanced Usage

### Bulk Sending

```javascript
const recipients = ["user1@example.com", "user2@example.com", "user3@example.com"];

const results = await mailer.sendBulk(recipients, {
  subject: "Weekly Newsletter",
  html: "<h1>Newsletter</h1><p>Check out our latest updates!</p>"
});

results.forEach(result => {
  if (result.success) {
    console.log(`✅ Email sent to ${result.recipient}`);
  } else {
    console.log(`❌ Failed to send to ${result.recipient}: ${result.error}`);
  }
});
```

### Retry Logic

```javascript
const result = await mailer.sendWithRetry({
  to: "user@example.com",
  subject: "Important Email",
  html: "<h1>Important Information</h1>"
}, 3); // Max 3 retries

if (result.success) {
  console.log("Email sent successfully:", result.messageId);
} else {
  console.log("Email failed after retries:", result.error);
}
```

### Template Management

```javascript
// List available templates
const availableTemplates = mailer.listAvailableTemplates("fr");
console.log("Available templates:", availableTemplates);

// Check if template exists
const exists = mailer.templateExists("password-reset", "fr");
console.log("Template exists:", exists);

// Get template information
const info = mailer.getTemplateInfo("password-reset", "fr");
console.log("Template info:", info);

// Register custom template at runtime
const customTemplate = `
  <div style="background: {{USER_COLOR}};">
    <h1>Hello {{USER_NAME}}!</h1>
    <p>Your favorite color is {{USER_COLOR}}.</p>
  </div>
`;

mailer.registerTemplateString("user-welcome", customTemplate, "fr");

// Clear template cache
mailer.clearCache();
```

### Template Directory Structure

```text
your-project/
├── templates/
│   ├── en-EN/
│   │   ├── welcome.xhtml
│   │   └── invoice.xhtml
│   └── fr-FR/
│       ├── welcome.xhtml
│       └── invoice.xhtml
```

### Custom Templates

You can create your own templates by adding `.xhtml` files to the templates directory:

```javascript
// Set custom templates path
const mailer = new EmailClient({
  templatesPath: "./my-custom-templates",
  defaultLang: "en"
});
```

#### Template Variables

Use `{{VARIABLE_NAME}}` syntax in your templates:

```xhtml
<!-- templates/en-EN/welcome.xhtml -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to {{APP_NAME}}</title>
</head>
<body>
    <h1>Welcome {{USER_NAME}}!</h1>
    <p>Thank you for joining {{APP_NAME}}.</p>
    <p>Your email: {{USER_EMAIL}}</p>
    <p>Visit us at: <a href="{{APP_URL}}">{{APP_URL}}</a></p>
    <p>Need help? Contact us at {{SUPPORT_EMAIL}}</p>
</body>
</html>
```

#### Template Subjects

Register subjects for your custom templates:

```javascript
// Register subjects for custom templates
mailer.registerSubject("welcome", "en", "Welcome to {{APP_NAME}}, {{USER_NAME}}!");
mailer.registerSubject("welcome", "fr", "Bienvenue sur {{APP_NAME}}, {{USER_NAME}} !");

// Or register multiple subjects at once
mailer.registerSubjects("welcome", {
  en: "Welcome to {{APP_NAME}}, {{USER_NAME}}!",
  fr: "Bienvenue sur {{APP_NAME}}, {{USER_NAME}} !",
  es: "¡Bienvenido a {{APP_NAME}}, {{USER_NAME}}!"
});
```

#### Dynamic Template Registration

Register templates at runtime without files:

```javascript
// Register a template string in memory
const customTemplate = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: {{USER_COLOR}};">Hello {{USER_NAME}}!</h1>
    <p>Your favorite color is {{USER_COLOR}}.</p>
    <p>Account created: {{CREATION_DATE}}</p>
  </div>
`;

mailer.registerTemplateString("user-welcome", customTemplate, "en");

// Use the registered template
const { html, subject } = mailer.compileMail("user-welcome", {
  variables: {
    USER_NAME: "John Doe",
    USER_COLOR: "#007bff",
    CREATION_DATE: new Date().toLocaleDateString()
  }
});
```

#### Template Inheritance and Composition

Create reusable template components:

```javascript
// Base template: templates/en-EN/email-base.xhtml
const baseTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>{{PAGE_TITLE}}</title>
  </head>
  <body style="font-family: Arial, sans-serif;">
    <header style="background: #f8f9fa; padding: 20px;">
      <h1>{{APP_NAME}}</h1>
    </header>
    <main style="padding: 20px;">
      {{CONTENT}}
    </main>
    <footer style="background: #f8f9fa; padding: 20px; text-align: center;">
      <p>&copy; {{CURRENT_YEAR}} {{APP_NAME}}. All rights reserved.</p>
    </footer>
  </body>
  </html>
`;

mailer.registerTemplateString("email-base", baseTemplate, "en");

// Content template: templates/en-EN/newsletter-content.xhtml
const contentTemplate = `
  <h2>Newsletter - {{NEWSLETTER_TITLE}}</h2>
  <p>{{NEWSLETTER_CONTENT}}</p>
  <ul>
    {{NEWSLETTER_ITEMS}}
  </ul>
`;

mailer.registerTemplateString("newsletter-content", contentTemplate, "en");

// Compose the final email
const content = mailer.compileTemplate("newsletter-content", {
  variables: {
    NEWSLETTER_TITLE: "Weekly Updates",
    NEWSLETTER_CONTENT: "Here are this week's highlights:",
    NEWSLETTER_ITEMS: items.map(item => `<li>${item.title}</li>`).join("")
  }
});

const { html, subject } = mailer.compileMail("email-base", {
  variables: {
    PAGE_TITLE: "Weekly Newsletter",
    CONTENT: content
  }
});
```

#### Template Validation and Error Handling

```javascript
// Check if template exists before using
if (mailer.templateExists("custom-template", "en")) {
  const { html, subject } = mailer.compileMail("custom-template", {
    variables: { USER_NAME: "John" }
  });
} else {
  console.error("Template 'custom-template' not found for language 'en'");
}

// Get detailed template information
const templateInfo = mailer.getTemplateInfo("custom-template", "en");
console.log("Template info:", {
  name: templateInfo.name,
  language: templateInfo.lang,
  exists: templateInfo.exists,
  source: templateInfo.source, // 'memory', 'disk', or 'none'
  cached: templateInfo.cached,
  path: templateInfo.path
});
```

### Configuration Testing

```javascript
const config = await mailer.testConfiguration();
console.log("Configuration test results:");
console.log(`SMTP: ${config.smtp ? '✅ Working' : '❌ Failed'}`);
console.log(`DKIM: ${config.dkim ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`Host: ${config.host}:${config.port} (${config.secure ? 'Secure' : 'Insecure'})`);
console.log(`Sender: ${config.sender}`);
console.log(`Default Language: ${config.defaultLang}`);
```

### Environment Variables

You can configure Composa using environment variables:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# DKIM Configuration (optional)
DKIM_DOMAIN=yourdomain.com
DKIM_SELECTOR=default
DKIM_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...

# Default sender
SMTP_FROM=noreply@yourdomain.com
```

```javascript
// Use environment variables
const mailer = new EmailClient({
  defaultLang: "en",
  // Transport will be created from environment variables
});
```

## CLI Tool

Composa includes an interactive CLI for easy setup:

```bash
npx composa setup
```

This will guide you through:
- Provider selection
- Credential configuration
- Template setup
- Testing your configuration

## TypeScript Support

Composa includes comprehensive TypeScript definitions:

- **IntelliSense** - Full auto-completion in your IDE
- **Type Safety** - Compile-time error checking
- **Documentation** - Inline help and parameter hints
- **Refactoring** - Safe renaming and code changes

### TypeScript Examples

```typescript
import { 
  EmailClient, 
  createGmailConfig, 
  type EmailClientOptions, 
  type MailOptions,
  type SendResult,
  type BulkSendResult 
} from "composa";

// Type-safe configuration
const options: EmailClientOptions = {
  defaultFrom: "noreply@myapp.com",
  defaultLang: "en",
  defaults: {
    APP_NAME: "My App",
    APP_URL: "https://myapp.com"
  },
  transporter: createGmailConfig("your-email@gmail.com", "your-app-password")
};

const client = new EmailClient(options);

// Type-safe email sending
const mailOptions: MailOptions = {
  to: "user@example.com",
  subject: "Welcome!",
  html: "<h1>Welcome to our app!</h1>"
};

const result: Promise<SendResult> = client.send(mailOptions);
```

See [TYPESCRIPT.md](TYPESCRIPT.md) for detailed TypeScript usage examples and advanced patterns.

## Examples

Check out the examples directory for more usage patterns:

- **[Basic Examples](examples/basic/)** - Simple usage patterns
- **[Advanced Examples](examples/advanced/)** - Complex scenarios
- **[TypeScript Examples](examples/typescript/)** - TypeScript-specific examples

## Documentation

- **[TYPESCRIPT.md](TYPESCRIPT.md)** - Complete TypeScript guide
- **[TEMPLATES.md](TEMPLATES.md)** - Template documentation
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Nodemailer](https://nodemailer.com/)
- Inspired by modern email best practices
- Templates designed for accessibility and compatibility

## Support

- [Report bugs](https://github.com/Pupariaa/composa/issues)
- [Request features](https://github.com/Pupariaa/composa/issues)
- [Documentation](https://github.com/Pupariaa/composa#readme)

---

Made with ❤️ by [Puparia](https://github.com/Pupariaa)
