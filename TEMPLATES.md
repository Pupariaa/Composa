# Custom Templates Guide

This guide explains how to create, customize, and use your own email templates with Composa.

## Template Structure

Composa uses a file-based template system with the following structure:

```
your-project/
├── templates/
│   ├── en-EN/                 # English templates
│   │   ├── welcome.xhtml      # Your custom template
│   │   └── invoice.xhtml      # Another custom template
│   ├── fr-FR/                 # French templates
│   │   ├── welcome.xhtml      # French version
│   │   └── invoice.xhtml      # French version
│   └── es-ES/                 # Spanish templates (optional)
│       ├── welcome.xhtml
│       └── invoice.xhtml
```

## Template Configuration

### Default Template Path

By default, Composa looks for templates in:

- `./templates/` (relative to your project root)
- Built-in templates are included in the package

### Custom Template Path

You can specify a custom template directory:

```javascript
import { EmailClient } from "composa";

const mailer = new EmailClient({
	templatesPath: "/path/to/your/templates",
	defaultLang: "en",
});
```

### Environment Variables

You can also set the template path via environment variables:

```bash
# Option 1
MAILER_TEMPLATES_PATH=/path/to/templates

# Option 2 (alternative)
EMAIL_TEMPLATES_PATH=/path/to/templates
```

## Creating Custom Templates

### XHTML Template Format

Templates are written in XHTML with variable placeholders:

```xhtml
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>{{ EMAIL_TITLE }}</title>
		<style type="text/css">
			/* Your CSS styles here */
			.container {
				max-width: 600px;
				margin: 0 auto;
			}
			.header {
				background-color: #f8f9fa;
				padding: 20px;
			}
			.content {
				padding: 30px;
			}
			.button {
				background-color: #007bff;
				color: white;
				padding: 12px 24px;
				text-decoration: none;
				border-radius: 4px;
				display: inline-block;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<h1>{{ APP_NAME }}</h1>
			</div>
			<div class="content">
				<h2>Hello {{ USER_NAME }}!</h2>
				<p>
					Welcome to our service. We're excited to have you on board.
				</p>

				<p>
					<a href="{{ ACTIVATION_URL }}" class="button">
						Activate Your Account
					</a>
				</p>

				<p>
					If you have any questions, please contact us at
					<a href="mailto:{{ SUPPORT_EMAIL }}">{{ SUPPORT_EMAIL }}</a>
				</p>
			</div>
		</div>
	</body>
</html>
```

### Variable Placeholders

Use `{{VARIABLE_NAME}}` syntax for dynamic content:

- `{{USER_NAME}}` - User's name
- `{{APP_NAME}}` - Your application name
- `{{APP_URL}}` - Your application URL
- `{{SUPPORT_EMAIL}}` - Support email address
- `{{CUSTOM_VARIABLE}}` - Any custom variable you define

### Conditional Content (Advanced)

You can use simple conditionals in templates:

```xhtml
<!-- Show content only if variable exists -->
{{#PROMO_CODE}}
<div class="promo">
	Use code <strong>{{ PROMO_CODE }}</strong> for discount!
</div>
{{/PROMO_CODE}}

<!-- Show alternative content if variable doesn't exist -->
{{^PROMO_CODE}}
<div class="info">No special offers at this time.</div>
{{/PROMO_CODE}}
```

## Multi-language Templates

### Language Codes

Composa uses standard language codes:

- `en-EN` or `en` for English
- `fr-FR` or `fr` for French
- `es-ES` or `es` for Spanish
- `de-DE` or `de` for German
- `it-IT` or `it` for Italian

### Creating Translations

1. Create language-specific directories
2. Use the same template filename in each language directory
3. Translate the content, keeping variable placeholders intact

Example:

```
templates/
├── en-EN/
│   └── welcome.xhtml     # English version
├── fr-FR/
│   └── welcome.xhtml     # French version
└── es-ES/
    └── welcome.xhtml     # Spanish version
```

## Using Custom Templates

### Basic Usage

```javascript
import { EmailClient, defaultSubjects } from "composa";

const mailer = new EmailClient({
	defaultLang: "en",
	subjects: defaultSubjects,
	templatesPath: "./my-templates", // Your custom template directory
});

// Send using your custom template
await mailer.sendTemplate({
	to: "user@example.com",
	template: "welcome", // Corresponds to welcome.xhtml
	lang: "en",
	variables: {
		USER_NAME: "John Doe",
		APP_NAME: "MyApp",
		ACTIVATION_URL: "https://myapp.com/activate/token123",
		SUPPORT_EMAIL: "support@myapp.com",
	},
});
```

### Custom Subjects

Register subjects for your custom templates:

```javascript
// Register subjects for your custom template
mailer.registerSubjects("welcome", {
	en: "Welcome to {{APP_NAME}}!",
	fr: "Bienvenue sur {{APP_NAME}} !",
	es: "¡Bienvenido a {{APP_NAME}}!",
});

// Or register multiple templates at once
const customSubjects = new Map();
customSubjects.set("welcome", {
	en: "Welcome to {{APP_NAME}}!",
	fr: "Bienvenue sur {{APP_NAME}} !",
});
customSubjects.set("invoice", {
	en: "Invoice #{{INVOICE_NUMBER}} from {{APP_NAME}}",
	fr: "Facture n°{{INVOICE_NUMBER}} de {{APP_NAME}}",
});

const mailer = new EmailClient({
	subjects: customSubjects,
	defaultLang: "en",
});
```

### In-Memory Templates

You can also register templates programmatically without files:

```javascript
// Register template content directly in code
mailer.templates.registerTemplateString(
	"simple-notification",
	`<html>
    <body>
      <h1>{{TITLE}}</h1>
      <p>{{MESSAGE}}</p>
    </body>
  </html>`,
	"en",
);

// Use the in-memory template
await mailer.sendTemplate({
	to: "user@example.com",
	template: "simple-notification",
	variables: {
		TITLE: "System Update",
		MESSAGE: "Your account has been updated successfully.",
	},
});
```

## Best Practices

### Template Design

1. **Keep it simple**: Avoid complex CSS that might not render in all email clients
2. **Use tables for layout**: Many email clients don't support modern CSS layout
3. **Inline styles**: Consider inlining critical CSS for better compatibility
4. **Test across clients**: Test in Gmail, Outlook, Apple Mail, etc.

### Variable Management

1. **Use descriptive names**: `USER_FULL_NAME` instead of `NAME`
2. **Provide defaults**: Use the `defaults` option for common variables
3. **Document variables**: List required variables in comments

### File Organization

```
templates/
├── common/
│   ├── header.xhtml      # Reusable components
│   └── footer.xhtml
├── en-EN/
│   ├── transactional/
│   │   ├── welcome.xhtml
│   │   └── password-reset.xhtml
│   └── marketing/
│       ├── newsletter.xhtml
│       └── promotion.xhtml
└── fr-FR/
    └── ... (same structure)
```

## Testing Templates

### Preview Templates

Create a test script to preview your templates:

```javascript
import { EmailClient } from "composa";

const mailer = new EmailClient({
	templatesPath: "./templates",
	transporter: {
		// Mock transporter for testing
		sendMail: async (options) => {
			console.log("Subject:", options.subject);
			console.log("HTML Preview:");
			console.log(options.html);
			return { messageId: "test" };
		},
	},
});

// Test your template
await mailer.sendTemplate({
	to: "test@example.com",
	template: "welcome",
	variables: {
		USER_NAME: "Test User",
		APP_NAME: "Test App",
		ACTIVATION_URL: "https://example.com/activate",
	},
});
```

### Template Validation

Validate your XHTML:

```bash
# Install a validator (optional)
npm install -g html-validator-cli

# Validate template
html-validator --file=templates/en-EN/welcome.xhtml
```

## Advanced Features

### Custom Template Engine Options

```javascript
const mailer = new EmailClient({
	templatesPath: "./templates",
	templateEngine: {
		// Custom file extension (default: .xhtml)
		extension: ".html",

		// Custom encoding (default: utf8)
		encoding: "utf8",

		// Cache templates in memory (default: true)
		cache: true,
	},
});
```

### Template Inheritance

Create base templates and extend them:

```xhtml
<!-- base.xhtml -->
<!DOCTYPE html>
<html>
	<head>
		<title>{{ APP_NAME }}</title>
		<!-- Common styles -->
	</head>
	<body>
		<div class="container">
			{{ CONTENT }}
		</div>
	</body>
</html>

<!-- welcome.xhtml -->
{{#extends "base"}}
{{#CONTENT}}
<h1>Welcome {{ USER_NAME }}!</h1>
<p>Thanks for joining us.</p>
{{/CONTENT}}
{{/extends}}
```

## Performance Tips

1. **Enable template caching** (enabled by default)
2. **Optimize images**: Use external hosting for images
3. **Minimize CSS**: Keep styles minimal and efficient
4. **Compress templates**: Remove unnecessary whitespace in production

## Need Help?

- [Main Documentation](README.md)
- [Report Issues](https://github.com/Pupariaa/composa/issues)
- [Request Features](https://github.com/Pupariaa/composa/issues)
- [Email Client Compatibility Guide](https://www.campaignmonitor.com/css/)

---

Happy templating with Composa!
