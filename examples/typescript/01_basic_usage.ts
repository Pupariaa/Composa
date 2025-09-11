/**
 * Basic TypeScript usage example for Composa
 * This example shows how to use Composa with full TypeScript support
 */

import { EmailClient, createGmailConfig, type EmailClientOptions, type MailOptions } from 'composa';

// Example 1: Basic setup with TypeScript types
async function basicExample() {
    // Type-safe configuration
    const options: EmailClientOptions = {
        defaultFrom: 'noreply@myapp.com',
        defaultLang: 'en',
        defaults: {
            APP_NAME: 'My Awesome App',
            APP_URL: 'https://myapp.com',
            SUPPORT_EMAIL: 'support@myapp.com'
        },
        transporter: createGmailConfig('your-email@gmail.com', 'your-app-password')
    };

    const client = new EmailClient(options);

    // Type-safe mail options
    const mailOptions: MailOptions = {
        to: 'user@example.com',
        subject: 'Welcome to our app!',
        html: '<h1>Welcome!</h1><p>Thank you for joining us.</p>'
    };

    try {
        const result = await client.send(mailOptions);
        console.log('Email sent successfully:', result);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

// Example 2: Using templates with type safety
async function templateExample() {
    const client = new EmailClient({
        defaultFrom: 'noreply@myapp.com',
        defaultLang: 'en',
        defaults: {
            APP_NAME: 'My App',
            APP_URL: 'https://myapp.com'
        }
    });

    // Type-safe template compilation
    const compiled = client.compileMail('password-reset', {
        lang: 'en',
        variables: {
            USER_NAME: 'John Doe',
            RESET_LINK: 'https://myapp.com/reset?token=abc123',
            EXPIRY_TIME: '24 hours'
        }
    });

    console.log('Compiled subject:', compiled.subject);
    console.log('Compiled HTML:', compiled.html);
}

// Example 3: Bulk sending with type safety
async function bulkExample() {
    const client = new EmailClient({
        defaultFrom: 'newsletter@myapp.com'
    });

    const recipients = [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com'
    ];

    const mailOptions: Omit<MailOptions, 'to'> = {
        subject: 'Weekly Newsletter',
        html: '<h1>Newsletter</h1><p>Check out our latest updates!</p>'
    };

    const results = await client.sendBulk(recipients, mailOptions);

    results.forEach(result => {
        if (result.success) {
            console.log(`✅ Email sent to ${result.recipient}`);
        } else {
            console.log(`❌ Failed to send to ${result.recipient}: ${result.error}`);
        }
    });
}

// Example 4: Configuration testing with types
async function configTestExample() {
    const client = new EmailClient({
        transporter: createGmailConfig('test@gmail.com', 'test-password')
    });

    const config = await client.testConfiguration();

    console.log('Configuration test results:');
    console.log(`SMTP: ${config.smtp ? '✅' : '❌'}`);
    console.log(`DKIM: ${config.dkim ? '✅' : '❌'}`);
    console.log(`Host: ${config.host}`);
    console.log(`Port: ${config.port}`);
    console.log(`Secure: ${config.secure}`);
}

// Run examples
async function main() {
    console.log('🚀 Running TypeScript examples...\n');

    try {
        console.log('1. Basic usage example:');
        await basicExample();
        console.log('\n2. Template example:');
        await templateExample();
        console.log('\n3. Bulk sending example:');
        await bulkExample();
        console.log('\n4. Configuration test example:');
        await configTestExample();
    } catch (error) {
        console.error('Example failed:', error);
    }
}

// Uncomment to run
// main();
