# 🎨 Composa

[![npm version](https://badge.fury.io/js/composa.svg)](https://badge.fury.io/js/composa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

Compose beautiful multilingual emails with XHTML templates and Nodemailer integration.

## Features

- **Multilingual Support** - Built-in French and English templates
- **Professional Templates** - Pre-designed XHTML email templates
- **Easy Configuration** - Simple setup with Nodemailer
- **Interactive CLI** - Guided setup for email providers with step-by-step instructions
- **Multiple Providers** - Support for Gmail, Yahoo, AOL, GMX, Zoho, and iCloud
- **Template Engine** - Variable interpolation and conditional rendering
- **Ready-to-use** - Pre-built templates for common use cases
- **Modern ESM** - ES modules with async/await support
- **Component-based Flow** - Compose templates like components (compileTemplate → compileMail → sendMail)
- **Security First** - Built-in warnings and best practices for credential management

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

### Basic Usage

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

## New Component-based Flow

Composa now uses a component-like approach where you can compose templates step by step:

### **Flow Overview:**

1. **`compileTemplate`** - Compile individual templates (like components)
2. **`compileMail`** - Combine templates into a complete email (HTML + subject)
3. **`sendMail`** - Send the final composed email

### **Advanced Example - Template Composition:**

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

### **Advanced Template Management Example:**

```javascript
// Check available templates before using them
const availableTemplates = mailer.listAvailableTemplates("fr");
console.log("Available templates:", availableTemplates);

// Dynamic template registration
const userSpecificTemplate = `
  <div style="background: {{USER_COLOR}};">
    <h1>Hello {{USER_NAME}}!</h1>
    <p>Your favorite color is {{USER_COLOR}}.</p>
  </div>
`;

mailer.registerTemplateString("user-welcome", userSpecificTemplate, "fr");

// Use the dynamic template
const { html, subject } = mailer.compileMail("user-welcome", {
	variables: {
		USER_NAME: "Alice",
		USER_COLOR: "#ff6b6b",
	},
});

// Get template info for debugging
const info = mailer.getTemplateInfo("user-welcome", "fr");
console.log("Template loaded from:", info.source); // 'memory'
```

This approach allows for:

- **Reusable components** - Create modular email parts
- **Dynamic composition** - Build complex emails from simple parts
- **Better testing** - Test individual components separately
- **Flexibility** - Mix and match templates as needed

## Security & Advanced Features

### **XSS Protection**

All template variables are automatically HTML-escaped to prevent XSS attacks:

```javascript
const { html } = mailer.compileMail("welcome", {
	variables: {
		USER_NAME: '<script>alert("hack")</script>', // Automatically escaped
		MESSAGE: "Hello & welcome!", // & becomes &amp;
	},
});
// Result: <script> becomes &lt;script&gt;, & becomes &amp;
```

### **Strict Mode**

Enable strict mode to throw errors instead of warnings for missing variables:

```javascript
const mailer = new EmailClient({
	defaultLang: "fr",
	subjects: defaultSubjects,
	options: { strictMode: true }, // Throws errors for missing variables
});

// This will throw an error instead of showing a warning
mailer.compileMail("password-reset", {
	variables: { USER_NAME: "John" }, // Missing RESET_URL will cause error
});
```

### **Template Validation**

Built-in protection against path traversal and invalid template names:

```javascript
// These will throw errors:
mailer.compileTemplate("../etc/passwd"); // Path traversal
mailer.compileTemplate(""); // Empty name
mailer.compileTemplate("template with spaces"); // Invalid characters
```

### **Cache Management**

Intelligent caching system with selective invalidation:

```javascript
// Register a new template (automatically clears cache)
mailer.registerTemplateString("dynamic-template", "<h1>{{TITLE}}</h1>");

// Clear cache for specific template
mailer.clearTemplateCache("password-reset", "fr");

// Clear all cache
mailer.clearCache();
```

## Retro-compatibility

Composa maintains backward compatibility with the previous API. You can still use the old methods:

### **Legacy API (Deprecated but supported)**

```javascript
// Old way (still works)
await mailer.sendTemplate({
	to: "user@example.com",
	template: "password-reset",
	lang: "fr",
	variables: {
		USER_NAME: "Jean Dupont",
		RESET_URL: "https://yourapp.com/reset/token123",
	},
});

// Old template rendering
const html = await mailer.render(
	"password-reset",
	{
		USER_NAME: "Jean Dupont",
		RESET_URL: "https://yourapp.com/reset/token123",
	},
	"fr",
);
```

### **Migration Guide**

| Old Method             | New Method                     | Notes                       |
| ---------------------- | ------------------------------ | --------------------------- |
| `sendTemplate()`       | `compileMail()` + `sendMail()` | Preferred approach          |
| `render()`             | `compileTemplate()`            | Synchronous, more efficient |
| `TemplateEngine` class | Use `EmailClient` methods      | Integrated, simpler         |

### **TemplateEngine Export**

For advanced use cases, the standalone `TemplateEngine` is still available:

```javascript
import { TemplateEngine } from "composa";

const engine = new TemplateEngine({
	defaultLang: "fr",
	templatesPath: "./my-templates",
	defaults: { APP_NAME: "MyApp" },
});

const html = engine.render("welcome", { USER_NAME: "John" });
```

## API Reference

### EmailClient Constructor

```javascript
const mailer = new EmailClient(options);
```

#### Options

| Option          | Type     | Description                             |
| --------------- | -------- | --------------------------------------- |
| `defaultLang`   | `string` | Default language (`'fr'`, `'en'`)       |
| `subjects`      | `Map`    | Email subjects by template and language |
| `defaults`      | `object` | Default variables for all templates     |
| `transport`     | `object` | Nodemailer transport configuration      |
| `transporter`   | `object` | Custom Nodemailer transporter instance  |
| `templatesPath` | `string` | Path to templates directory             |
| `options`       | `object` | Advanced options (see below)            |

#### Advanced Options

| Option               | Type      | Description                                           |
| -------------------- | --------- | ----------------------------------------------------- |
| `options.strictMode` | `boolean` | Throw errors for missing variables (default: `false`) |

### Methods

#### `compileTemplate(templateName, options)`

Compile a single template with variables.

```javascript
const html = mailer.compileTemplate("password-reset", {
	lang: "fr",
	variables: {
		USER_NAME: "User Name",
		RESET_URL: "https://example.com/reset",
	},
});
```

#### `compileMail(templateName, options)`

Compile a complete email (HTML + subject) from a template.

```javascript
const { html, subject } = mailer.compileMail("password-reset", {
	lang: "fr",
	variables: {
		USER_NAME: "User Name",
		RESET_URL: "https://example.com/reset",
	},
});
```

#### `sendMail(mailOptions)`

Send a compiled email.

```javascript
await mailer.sendMail({
	to: "recipient@example.com",
	html,
	subject,
	from: "noreply@example.com", // optional
});
```

#### `registerTemplateString(templateName, templateString, lang)`

Register a template from a string (useful for dynamic templates).

```javascript
mailer.registerTemplateString(
	"dynamic-welcome",
	`
  <h1>Hello {{USER_NAME}}!</h1>
  <p>Welcome to {{APP_NAME}}.</p>
`,
	"en",
);
```

#### Template Management Methods

```javascript
// List available templates
const templates = mailer.listAvailableTemplates("fr");
console.log("Available FR templates:", templates);

// Check if template exists
if (mailer.templateExists("password-reset", "fr")) {
	console.log("Template exists!");
}

// Get detailed template info
const info = mailer.getTemplateInfo("password-reset", "fr");
console.log("Template info:", info);
// Output: { name: 'password-reset', lang: 'fr', exists: true, source: 'disk', cached: true, path: '/path/to/template.xhtml' }

// Clear cache for specific template
mailer.clearTemplateCache("password-reset", "fr");

// Clear all cache
mailer.clearCache();
```

#### `sendBulk(recipients, mailOptions)`

Send the same email to multiple recipients.

```javascript
const { html, subject } = mailer.compileMail("newsletter-promotion", {
	lang: "fr",
	variables: { PROMO_CODE: "SAVE20" },
});

await mailer.sendBulk(["user1@example.com", "user2@example.com"], {
	html,
	subject,
});
```

## Template Variables

Each template supports specific variables. Here are the common ones:

### Password Reset Template

- `USER_NAME` - Recipient's name
- `USER_EMAIL` - Recipient's email
- `RESET_URL` - Password reset link
- `EXPIRATION_TIME` - Link expiration time

### Account Creation Template

- `USER_NAME` - New user's name
- `USER_EMAIL` - New user's email
- `ACTIVATION_URL` - Account activation link
- `APP_URL` - Your application URL

### Security Alert Template

- `USER_NAME` - User's name
- `LOGIN_TIME` - Time of suspicious login
- `IP_ADDRESS` - Source IP address
- `LOCATION` - Geographic location
- `SECURE_URL` - Security settings URL

## Internationalization

The package comes with built-in French and English templates. You can extend with your own languages:

```javascript
// Add custom subjects
mailer.registerSubjects("password-reset", {
	es: "Restablecer contraseña",
	de: "Passwort zurücksetzen",
});

// Create custom templates in templates/es-ES/ or templates/de-DE/
```

## Email Provider Setup (Simplified!)

Composa makes email provider setup super easy with dedicated helper functions. No more complex SMTP configurations!

### Quick Setup (Recommended)

```javascript
import { EmailClient, defaultSubjects, createGmailConfig } from "composa";

// Gmail - just 2 parameters!
const mailer = new EmailClient({
	defaultLang: "fr",
	subjects: defaultSubjects,
	transport: createGmailConfig("your@gmail.com", "your-app-password"),
});

// That's it! No need to remember SMTP settings.
```

### Available Quick Setup Functions

| Function                                | Provider           | What you need                |
| --------------------------------------- | ------------------ | ---------------------------- |
| `createGmailConfig(email, appPassword)` | Gmail              | Gmail address + App Password |
| `createYahooConfig(email, appPassword)` | Yahoo              | Yahoo address + App Password |
| `createAOLConfig(email, appPassword)`   | AOL                | AOL address + App Password   |
| `createGMXConfig(email, password)`      | GMX                | GMX address + password       |
| `createZohoConfig(email, password)`     | Zoho               | Zoho address + App Password  |
| `createiCloudConfig(email, appPassword)`| iCloud             | iCloud address + App Password|

### Examples - Copy & Paste Ready

```javascript
import {
	EmailClient,
	defaultSubjects,
	createGmailConfig,
	createYahooConfig,
	createAOLConfig,
	createGMXConfig,
	createZohoConfig,
	createiCloudConfig,
} from "composa";

// Gmail setup (requires App Password)
const gmailMailer = new EmailClient({
	defaultLang: "fr",
	subjects: defaultSubjects,
	transport: createGmailConfig("me@gmail.com", "myapppassword123"),
});

// Yahoo setup (requires App Password)
const yahooMailer = new EmailClient({
	defaultLang: "en",
	subjects: defaultSubjects,
	transport: createYahooConfig("me@yahoo.com", "myapppassword123"),
});

// AOL setup (requires App Password)
const aolMailer = new EmailClient({
	defaultLang: "en",
	subjects: defaultSubjects,
	transport: createAOLConfig("me@aol.com", "myapppassword123"),
});

// GMX setup (regular password or App Password)
const gmxMailer = new EmailClient({
	defaultLang: "en",
	subjects: defaultSubjects,
	transport: createGMXConfig("me@gmx.com", "mypassword"),
});

// Zoho setup (requires App Password)
const zohoMailer = new EmailClient({
	defaultLang: "en",
	subjects: defaultSubjects,
	transport: createZohoConfig("me@zoho.com", "myapppassword123"),
});

// iCloud setup (requires App Password)
const icloudMailer = new EmailClient({
	defaultLang: "en",
	subjects: defaultSubjects,
	transport: createiCloudConfig("me@icloud.com", "myapppassword123"),
});
```

### Need Setup Instructions?

Get step-by-step instructions for any provider:

```javascript
import { getProviderSetup } from "composa";

// Get Gmail setup instructions
const gmailSetup = getProviderSetup("gmail");
console.log(gmailSetup.setupSteps);
/*
[
  "1. Enable 2-Factor Authentication on your Google account",
  "2. Go to Google Account settings > Security > 2-Step Verification", 
  "3. Generate an 'App Password' for 'Mail'",
  "4. Use your Gmail address and the App Password"
]
*/
```

### Advanced Setup (if needed)

For complete control, use the full configuration:

```javascript
import { createProviderConfig } from "composa";

const customConfig = createProviderConfig(
	"gmail",
	{
		user: "your@gmail.com",
		pass: "your-app-password",
	},
	{
		// Optional: advanced settings
		pool: true,
		maxConnections: 5,
		rateLimit: 10,
	},
);
```

### Custom SMTP Configuration

For providers not included in presets:

```javascript
const mailer = new EmailClient({
	defaultLang: "fr",
	subjects: defaultSubjects,
	transport: {
		host: "mail.yourserver.com",
		port: 465,
		secure: true,
		auth: {
			user: "noreply@yourserver.com",
			pass: "your-password",
		},
	},
});
```

### Environment Variables

You can also use environment variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

```javascript
// Will automatically use environment variables
const mailer = new EmailClient({
	defaultLang: "fr",
	subjects: defaultSubjects,
});
```

## Interactive CLI Setup

Composa includes a powerful CLI tool that guides you through setting up your email provider with step-by-step instructions.

### Quick Setup Commands

```bash
# Setup Gmail with App Passwords
npx composa gmail

# Setup Yahoo with App Passwords  
npx composa yahoo

# Setup AOL with App Passwords
npx composa aol

# Setup GMX (regular password or App Password)
npx composa gmx

# Setup Zoho with App Passwords
npx composa zoho

# Setup iCloud with App Passwords
npx composa icloud

# List all available providers
npx composa list

# Show help
npx composa help
```

### What the CLI Does

The CLI provides an interactive setup experience that:

- **Guides you through 2FA setup** for providers that require it
- **Helps you generate App Passwords** with step-by-step instructions
- **Generates ready-to-use code** with proper imports and configuration
- **Includes security warnings** about environment variables and best practices
- **Offers to save configuration** to a file for easy integration

### Example CLI Session

```bash
$ npx composa gmail

╔══════════════════════════════════════════════════════════════╗
║                        Composa CLI                           ║
║              Interactive Email Provider Setup                ║
╚══════════════════════════════════════════════════════════════╝

Setting up GMAIL App Password configuration
────────────────────────────────────────────────────────────

Welcome to the Gmail App Password Setup!
This will guide you through enabling 2FA and creating an App Password for Gmail.

STEP 1: Enable Two-Factor Authentication
────────────────────────────────────────

1. Go to your Google Account settings:
   https://myaccount.google.com/

2. Click on "Security" in the left sidebar

3. Under "Signing in to Google", click "2-Step Verification"

4. Follow the setup process to enable 2FA
   • You'll need your phone for verification
   • This is required to create App Passwords

Have you enabled 2-Step Verification? (y/N): y

STEP 2: Generate App Password
─────────────────────────────

1. Go to Google App Passwords:
   https://myaccount.google.com/apppasswords

2. Sign in with your Google account

3. Select "Mail" as the app

4. Select "Other (Custom name)" as the device

5. Enter a name for your app (e.g., "My App")

6. Click "Generate"

7. Copy the 16-character App Password (e.g., "abcd efgh ijkl mnop")

Enter your Gmail address: your-email@gmail.com
Enter your App Password: abcd efgh ijkl mnop

Copy this code into your project:
────────────────────────────────────────────────────────────
import { EmailClient, defaultSubjects, createGmailConfig } from "composa";

const gmailMailer = new EmailClient({
    defaultLang: "fr",
    transport: createGmailConfig(
        "your-email@gmail.com",
        "abcdefghijklmnop"
    ),
});

// Send an email
const result = await gmailMailer.sendMail({
    to: "user@example.com",
    subject: "Test Email",
    html: "<h1>Hello from Composa!</h1>"
});
console.log("Email sent:", result);
────────────────────────────────────────────────────────────

SECURITY WARNING:
The code above contains your email credentials in plain text.
For production use, store credentials in environment variables:
  - Create a .env file with EMAIL_USER and EMAIL_PASS
  - Use process.env.EMAIL_USER and process.env.EMAIL_PASS
  - Add .env to your .gitignore file

Press Enter when you have copied the code above...

Do you want to save this code to a file? (y/N): y
Enter filename (e.g., gmail-setup.js): my-gmail-config.js
Code saved to my-gmail-config.js

Gmail Setup Complete!
```

### Security Features

The CLI includes built-in security recommendations:

- **Environment Variable Warnings**: Reminds you to use `.env` files in production
- **Credential Protection**: Warns against committing credentials to version control
- **Best Practices**: Provides guidance on secure credential management

## Custom Templates

Composa supports custom email templates for your specific needs.

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

### Using Custom Templates

```javascript
import { EmailClient } from "composa";

const mailer = new EmailClient({
	templatesPath: "./my-templates", // Path to your templates
	defaultLang: "en",
});

// Use your custom template
const { html, subject } = mailer.compileMail("welcome", {
	variables: {
		USER_NAME: "John Doe",
		APP_NAME: "MyApp",
	},
});

await mailer.sendMail({
	to: "user@example.com",
	html,
	subject,
});
```

### Template Format (XHTML)

```xhtml
<!DOCTYPE html>
<html>
	<head>
		<title>{{ APP_NAME }}</title>
		<style>
			.container {
				max-width: 600px;
				margin: 0 auto;
			}
			.button {
				background-color: #007bff;
				color: white;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<h1>Hello {{ USER_NAME }}!</h1>
			<p>Welcome to {{ APP_NAME }}.</p>
			<a href="{{ ACTIVATION_URL }}" class="button"> Activate Account </a>
		</div>
	</body>
</html>
```

### Custom Subjects

Register subjects for your custom templates:

```javascript
// Register subjects for custom templates
mailer.registerSubjects("welcome", {
	en: "Welcome to {{APP_NAME}}!",
	fr: "Bienvenue sur {{APP_NAME}} !",
});

// Or use in constructor
const customSubjects = new Map();
customSubjects.set("welcome", {
	en: "Welcome to {{APP_NAME}}!",
	fr: "Bienvenue sur {{APP_NAME}} !",
});

const mailer = new EmailClient({
	subjects: customSubjects,
	templatesPath: "./templates",
});
```

### Environment Variables for Templates

```bash
# Set custom template directory
MAILER_TEMPLATES_PATH=./my-custom-templates
# or
EMAIL_TEMPLATES_PATH=./my-custom-templates
```

**[Complete Templates Guide](TEMPLATES.md)** - Detailed documentation on creating and customizing templates

## Development

### Local Setup

```bash
git clone https://github.com/puparia/composa.git
cd composa
npm install
```

### Testing

```bash
npm test
```

### Running Examples

```bash
npm run example
```

## Project Structure

```text
composa/
├── src/
│   ├── index.js              # Main exports
│   ├── email-client.js       # EmailClient class (integrated template engine)
│   ├── template-engine.js    # Standalone TemplateEngine (retro-compatibility)
│   ├── email-providers.js    # Email provider configurations
│   └── default-subjects.js   # Built-in subjects
├── templates/
│   ├── fr-FR/               # French templates
│   └── en-EN/               # English templates
├── examples/
│   ├── basic/               # Basic usage examples
│   └── advanced/            # Advanced composition examples
├── README.md
└── package.json
```

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
