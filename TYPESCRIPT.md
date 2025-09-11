# TypeScript Support for Composa

Composa now includes full TypeScript support, allowing you to use the library with complete type safety, IntelliSense, and compile-time error checking.

## Quick Start

### Installation

```bash
npm install composa
npm install -D typescript @types/node
```

### Basic Usage

```typescript
import { EmailClient, createGmailConfig, type EmailClientOptions, type MailOptions } from 'composa';

const options: EmailClientOptions = {
  defaultFrom: 'noreply@myapp.com',
  defaultLang: 'en',
  defaults: {
    APP_NAME: 'My App',
    APP_URL: 'https://myapp.com'
  },
  transporter: createGmailConfig('your-email@gmail.com', 'your-app-password')
};

const client = new EmailClient(options);

const mailOptions: MailOptions = {
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our app!</h1>'
};

const result = await client.send(mailOptions);
```

## Type Definitions

Composa provides comprehensive TypeScript definitions for all its APIs:

### Core Types

- `EmailClientOptions` - Configuration options for EmailClient
- `MailOptions` - Email sending options
- `SendResult` - Result of email sending operation
- `BulkSendResult` - Result of bulk email sending
- `TemplateOptions` - Template compilation options
- `CompiledMail` - Compiled template result

### Provider Types

- `EmailProvider` - Email provider configuration
- `ProviderCredentials` - Authentication credentials
- `ProviderOptions` - Advanced provider options
- `ProviderSetup` - Provider setup information

### Template Engine Types

- `TemplateEngineOptions` - Template engine configuration
- `TemplateInfo` - Template information

## Benefits of TypeScript Support

### 1. **IntelliSense and Auto-completion**

Get full IntelliSense support in your IDE:

```typescript
const client = new EmailClient({
  // IDE will suggest available options
  defaultFrom: 'noreply@myapp.com',
  defaultLang: 'en',
  // ... other options
});
```

### 2. **Compile-time Error Detection**

Catch errors before runtime:

```typescript
// This will cause a TypeScript error
const mailOptions: MailOptions = {
  to: 'user@example.com',
  // subject: 'Welcome!', // Missing required field
  html: '<h1>Welcome!</h1>'
};
```

### 3. **Type-safe Configuration**

Ensure your configuration is correct:

```typescript
const options: EmailClientOptions = {
  defaultFrom: 'noreply@myapp.com',
  defaultLang: 'en', // TypeScript knows this should be a string
  defaults: {
    APP_NAME: 'My App',
    APP_URL: 'https://myapp.com'
  }
};
```

### 4. **Better Refactoring Support**

IDEs can safely rename and refactor your code with full type information.

## Advanced Usage

### Custom Interfaces

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  language: 'en' | 'fr' | 'es';
}

class EmailService {
  private client: EmailClient;

  constructor(options: EmailClientOptions) {
    this.client = new EmailClient(options);
  }

  async sendWelcomeEmail(user: User): Promise<SendResult> {
    const compiled = this.client.compileMail('welcome', {
      lang: user.language,
      variables: {
        USER_NAME: user.name,
        USER_EMAIL: user.email
      }
    });

    return this.client.send({
      to: user.email,
      subject: compiled.subject,
      html: compiled.html
    });
  }
}
```

### Provider Configuration

```typescript
import { createGmailConfig, createYahooConfig, type ProviderOptions } from 'composa';

// Type-safe Gmail configuration
const gmailConfig = createGmailConfig('your-email@gmail.com', 'your-app-password');

// Type-safe Yahoo configuration
const yahooConfig = createYahooConfig('your-email@yahoo.com', 'your-app-password');

// Advanced options with types
const advancedOptions: ProviderOptions = {
  pool: true,
  maxConnections: 5,
  maxMessages: 10,
  rateLimit: 10,
  tls: {
    rejectUnauthorized: true
  }
};
```

### Error Handling

```typescript
try {
  const result = await client.send(mailOptions);
  
  if (result.success) {
    console.log('Email sent successfully:', result.messageId);
  } else {
    console.error('Email failed:', result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Configuration

### tsconfig.json

For your TypeScript project, use this configuration:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

### Package.json

```json
{
  "dependencies": {
    "composa": "^1.2.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

## Examples

Check out the TypeScript examples in the `examples/typescript/` directory:

- `01_basic_usage.ts` - Basic TypeScript usage patterns
- `02_advanced_types.ts` - Advanced TypeScript features
- `03_provider_configuration.ts` - Provider configuration with types

## Migration from JavaScript

If you're migrating from JavaScript to TypeScript:

1. **Install TypeScript dependencies**:
   ```bash
   npm install -D typescript @types/node
   ```

2. **Rename your files** from `.js` to `.ts`

3. **Add type annotations**:
   ```typescript
   // Before (JavaScript)
   const client = new EmailClient(options);
   
   // After (TypeScript)
   const client = new EmailClient(options);
   const options: EmailClientOptions = { /* ... */ };
   ```

4. **Update imports** (if needed):
   ```typescript
   import { EmailClient, type EmailClientOptions } from 'composa';
   ```

## Troubleshooting

### Common Issues

1. **"Module not found" errors**: Ensure you have the latest version of Composa installed
2. **Type errors**: Check that your TypeScript version is 5.0 or higher
3. **Import issues**: Use ES module syntax (`import` not `require`)

### Getting Help

- Check the main [README.md](README.md) for general usage
- Review the [TEMPLATES.md](TEMPLATES.md) for template information
- Look at the TypeScript examples in `examples/typescript/`
- Open an issue on GitHub for TypeScript-specific problems

## Contributing

TypeScript definitions are located in `src/types.d.ts`. When contributing:

1. Update the type definitions when changing the JavaScript API
2. Test changes with the TypeScript examples
3. Ensure all new features have proper type coverage
4. Update this documentation when adding new types

## Version Compatibility

- **Composa 1.2.0+**: Full TypeScript support
- **TypeScript 5.0+**: Recommended for best experience
- **Node.js 14+**: Required for ES modules support
