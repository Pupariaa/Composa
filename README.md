# 🎨 Composa

[![npm version](https://badge.fury.io/js/composa.svg)](https://badge.fury.io/js/Composa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

Compose beautiful multilingual emails with XHTML templates and Nodemailer integration.

## Features

- **Multilingual Support** - Built-in French and English templates
- **Professional Templates** - Pre-designed XHTML email templates
- **Easy Configuration** - Simple setup with Nodemailer
- **Template Engine** - Variable interpolation and conditional rendering  
- **Ready-to-use** - Pre-built templates for common use cases
   **Modern ESM** - ES modules with async/await support

## 📋 Available Templates

| Template | French | English | Use Case |
|----------|--------|---------|----------|
| `password-reset` | ✅ | ✅ | Password reset emails |
| `account-creation` | ✅ | ✅ | Welcome new users |
| `suspicious-login` | ✅ | ✅ | Security alerts |
| `subscription-confirmation` | ✅ | ✅ | Newsletter subscriptions |
| `newsletter-promotion` | ✅ | ✅ | Marketing campaigns |
| `scheduled-maintenance` | ✅ | ✅ | System notifications |

## Quick Start

### Installation

```bash
npm install composa
```

### Basic Usage

```javascript
import { EmailClient, defaultSubjects } from 'composa';

const mailer = new EmailClient({
  defaultLang: 'fr',
  subjects: defaultSubjects,
  transport: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  }
});

// Send a password reset email
const result = await mailer.sendTemplate({
  to: 'user@example.com',
  template: 'password-reset',
  lang: 'fr',
  variables: {
    USER_NAME: 'Jean Dupont',
    USER_EMAIL: 'user@example.com',
    RESET_URL: 'https://yourapp.com/reset/token123',
    EXPIRATION_TIME: '24 heures'
  }
});

console.log('Email sent:', result);
```

## API Reference

### EmailClient Constructor

```javascript
const mailer = new EmailClient(options);
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `defaultLang` | `string` | Default language (`'fr'`, `'en'`) |
| `subjects` | `Map` | Email subjects by template and language |
| `defaults` | `object` | Default variables for all templates |
| `transport` | `object` | Nodemailer transport configuration |
| `transporter` | `object` | Custom Nodemailer transporter instance |

### Methods

#### `sendTemplate(options)`

Send an email using a template.

```javascript
await mailer.sendTemplate({
  to: 'recipient@example.com',
  template: 'password-reset',
  lang: 'fr',
  variables: {
    USER_NAME: 'User Name',
    // ... other variables
  }
});
```

#### `sendBulk(recipients, mailOptions)`

Send the same email to multiple recipients.

```javascript
await mailer.sendBulk(
  ['user1@example.com', 'user2@example.com'],
  {
    template: 'newsletter-promotion',
    lang: 'fr',
    variables: { PROMO_CODE: 'SAVE20' }
  }
);
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
mailer.registerSubjects('password-reset', {
  'es': 'Restablecer contraseña',
  'de': 'Passwort zurücksetzen'
});

// Create custom templates in templates/es-ES/ or templates/de-DE/
```

## Email Provider Setup (Simplified!)

Composa makes email provider setup super easy with dedicated helper functions. No more complex SMTP configurations!

### Quick Setup (Recommended)

```javascript
import { EmailClient, defaultSubjects, createGmailConfig } from 'composa';

// Gmail - just 2 parameters!
const mailer = new EmailClient({
  defaultLang: 'fr',
  subjects: defaultSubjects,
  transport: createGmailConfig('your@gmail.com', 'your-app-password')
});

// That's it! No need to remember SMTP settings.
```

### vailable Quick Setup Functions

| Function | Provider | What you need |
|----------|----------|---------------|
| `createGmailConfig(email, appPassword)` | Gmail | Gmail address + App Password |
| `createOutlookConfig(email, password)` | Outlook/Hotmail | Outlook address + password |
| `createYahooConfig(email, appPassword)` | Yahoo | Yahoo address + App Password |
| `createSendGridConfig(apiKey)` | SendGrid | Just your API key |
| `createMailgunConfig(domain, apiKey)` | Mailgun | Domain + API key |
| `createTestConfig(user, pass)` | Ethereal (testing) | Test credentials |

### Examples - Copy & Paste Ready

```javascript
import { 
  EmailClient, 
  defaultSubjects,
  createGmailConfig,
  createOutlookConfig,
  createSendGridConfig 
} from 'composa';

// Gmail setup (requires App Password)
const gmailMailer = new EmailClient({
  defaultLang: 'fr',
  subjects: defaultSubjects,
  transport: createGmailConfig('me@gmail.com', 'myapppassword123')
});

// Outlook setup (simple password)
const outlookMailer = new EmailClient({
  defaultLang: 'en', 
  subjects: defaultSubjects,
  transport: createOutlookConfig('me@outlook.com', 'mypassword')
});

// SendGrid setup (just API key)
const sendgridMailer = new EmailClient({
  defaultLang: 'en',
  subjects: defaultSubjects, 
  transport: createSendGridConfig('SG.your-api-key-here')
});
```

### Need Setup Instructions?

Get step-by-step instructions for any provider:

```javascript
import { getProviderSetup } from 'composa';

// Get Gmail setup instructions
const gmailSetup = getProviderSetup('gmail');
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
import { createProviderConfig } from 'composa';

const customConfig = createProviderConfig('gmail', {
  user: 'your@gmail.com',
  pass: 'your-app-password'
}, {
  // Optional: advanced settings
  pool: true,
  maxConnections: 5,
  rateLimit: 10
});
```

### Custom SMTP Configuration

For providers not included in presets:

```javascript
const mailer = new EmailClient({
  defaultLang: 'fr',
  subjects: defaultSubjects,
  transport: {
    host: 'mail.yourserver.com',
    port: 465,
    secure: true,
    auth: {
      user: 'noreply@yourserver.com',
      pass: 'your-password'
    }
  }
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
  defaultLang: 'fr',
  subjects: defaultSubjects
});
```

## Custom Templates

Composa supports custom email templates for your specific needs.

### Template Directory Structure

```
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
import { EmailClient } from 'composa';

const mailer = new EmailClient({
  templatesPath: './my-templates',  // Path to your templates
  defaultLang: 'en'
});

// Use your custom template
await mailer.sendTemplate({
  to: 'user@example.com',
  template: 'welcome',  // Corresponds to welcome.xhtml
  variables: {
    USER_NAME: 'John Doe',
    APP_NAME: 'MyApp'
  }
});
```

### Template Format (XHTML)

```xhtml
<!DOCTYPE html>
<html>
<head>
    <title>{{APP_NAME}}</title>
    <style>
        .container { max-width: 600px; margin: 0 auto; }
        .button { background-color: #007bff; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello {{USER_NAME}}!</h1>
        <p>Welcome to {{APP_NAME}}.</p>
        <a href="{{ACTIVATION_URL}}" class="button">
            Activate Account
        </a>
    </div>
</body>
</html>
```

### Custom Subjects

Register subjects for your custom templates:

```javascript
// Register subjects for custom templates
mailer.registerSubjects('welcome', {
  'en': 'Welcome to {{APP_NAME}}!',
  'fr': 'Bienvenue sur {{APP_NAME}} !'
});

// Or use in constructor
const customSubjects = new Map();
customSubjects.set('welcome', {
  'en': 'Welcome to {{APP_NAME}}!',
  'fr': 'Bienvenue sur {{APP_NAME}} !'
});

const mailer = new EmailClient({
  subjects: customSubjects,
  templatesPath: './templates'
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

```
composa/
├── src/
│   ├── index.js              # Main exports
│   ├── email-client.js       # EmailClient class
│   ├── template-engine.js    # Template processing
│   └── default-subjects.js   # Built-in subjects
├── templates/
│   ├── fr-FR/               # French templates
│   └── en-EN/               # English templates
├── examples/
│   └── basic-usage.js       # Usage examples
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
