# TypeScript Examples for Composa

This directory contains TypeScript examples showing how to use Composa with full type safety and IntelliSense support.

## Prerequisites

Make sure you have TypeScript installed in your project:

```bash
npm install -D typescript @types/node
```

## Examples

### 1. Basic Usage (`01_basic_usage.ts`)

Shows the fundamental TypeScript usage patterns:
- Type-safe configuration
- Type-safe email sending
- Template compilation with types
- Bulk email sending
- Configuration testing

### 2. Advanced Types (`02_advanced_types.ts`)

Demonstrates advanced TypeScript features:
- Custom interfaces and types
- Type-safe service classes
- Generic type usage
- Error handling with types
- Complex data structures

### 3. Provider Configuration (`03_provider_configuration.ts`)

Shows how to configure different email providers with full type safety:
- Provider-specific configuration functions
- Type-safe credential handling
- Advanced configuration options
- Provider setup information

## Running the Examples

### Option 1: Using ts-node (Recommended)

```bash
# Install ts-node globally
npm install -g ts-node

# Run examples directly
npx ts-node examples/typescript/01_basic_usage.ts
npx ts-node examples/typescript/02_advanced_types.ts
npx ts-node examples/typescript/03_provider_configuration.ts
```

### Option 2: Compile and Run

```bash
# Compile TypeScript to JavaScript
npx tsc examples/typescript/01_basic_usage.ts --outDir dist --target ES2020 --module ESNext --moduleResolution node

# Run the compiled JavaScript
node dist/01_basic_usage.js
```

### Option 3: Using tsx (Alternative to ts-node)

```bash
# Install tsx
npm install -D tsx

# Run examples
npx tsx examples/typescript/01_basic_usage.ts
```

## Type Safety Benefits

When using Composa with TypeScript, you get:

### 1. **IntelliSense Support**
- Auto-completion for all methods and properties
- Parameter hints and documentation
- Type checking at compile time

### 2. **Compile-time Error Detection**
- Catch configuration errors before runtime
- Validate email addresses and options
- Ensure proper method usage

### 3. **Better Developer Experience**
- Refactoring support
- Go-to-definition functionality
- Inline documentation

### 4. **Type-safe Configuration**
```typescript
const options: EmailClientOptions = {
  defaultFrom: 'noreply@myapp.com',
  defaultLang: 'en',
  defaults: {
    APP_NAME: 'My App',
    APP_URL: 'https://myapp.com'
  }
};
```

### 5. **Type-safe Email Sending**
```typescript
const mailOptions: MailOptions = {
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome!</h1>'
};

const result: SendResult = await client.send(mailOptions);
```

## Configuration

### tsconfig.json

For your own TypeScript projects, use this configuration:

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

Make sure your package.json includes the types:

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

## Common Patterns

### 1. Custom Email Service Class

```typescript
class EmailService {
  private client: EmailClient;

  constructor(config: EmailClientOptions) {
    this.client = new EmailClient(config);
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

### 2. Type-safe Provider Configuration

```typescript
const gmailConfig = createGmailConfig('your-email@gmail.com', 'your-app-password');
const client = new EmailClient({
  transporter: gmailConfig,
  defaultFrom: 'noreply@myapp.com'
});
```

### 3. Error Handling with Types

```typescript
try {
  const result = await client.send(mailOptions);
  if (result.success) {
    console.log('Email sent:', result.messageId);
  } else {
    console.error('Email failed:', result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Troubleshooting

### Common Issues

1. **Module not found**: Make sure you have the latest version of Composa installed
2. **Type errors**: Ensure your TypeScript version is compatible (5.0+)
3. **Import issues**: Use ES module imports (`import` not `require`)

### Getting Help

- Check the main [README.md](../../README.md) for general usage
- Review the [TEMPLATES.md](../../TEMPLATES.md) for template information
- Open an issue on GitHub for TypeScript-specific problems

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
