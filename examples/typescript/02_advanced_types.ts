/**
 * Advanced TypeScript usage example for Composa
 * This example shows advanced type usage and custom interfaces
 */

import {
    EmailClient,
    createProviderConfig,
    getProviderSetup,
    type EmailClientOptions,
    type ProviderOptions,
    type TemplateOptions,
    type SendResult,
    type BulkSendResult
} from 'composa';

// Custom interface for our application
interface User {
    id: string;
    email: string;
    name: string;
    language: 'en' | 'fr' | 'es';
}

interface EmailTemplate {
    name: string;
    subject: Record<string, string>;
    variables: Record<string, any>;
}

// Custom email service class with full TypeScript support
class TypedEmailService {
    private client: EmailClient;
    private templates: Map<string, EmailTemplate> = new Map();

    constructor(options: EmailClientOptions) {
        this.client = new EmailClient(options);
        this.setupTemplates();
    }

    private setupTemplates(): void {
        // Type-safe template registration
        this.templates.set('welcome', {
            name: 'welcome',
            subject: {
                en: 'Welcome to {{APP_NAME}}, {{USER_NAME}}!',
                fr: 'Bienvenue sur {{APP_NAME}}, {{USER_NAME}} !',
                es: '¡Bienvenido a {{APP_NAME}}, {{USER_NAME}}!'
            },
            variables: {
                USER_NAME: '',
                USER_EMAIL: '',
                ACTIVATION_LINK: ''
            }
        });

        this.templates.set('password-reset', {
            name: 'password-reset',
            subject: {
                en: 'Reset your password',
                fr: 'Réinitialisez votre mot de passe',
                es: 'Restablece tu contraseña'
            },
            variables: {
                USER_NAME: '',
                RESET_LINK: '',
                EXPIRY_TIME: ''
            }
        });
    }

    // Type-safe method to send welcome email
    async sendWelcomeEmail(user: User, activationLink: string): Promise<SendResult> {
        const template = this.templates.get('welcome');
        if (!template) {
            throw new Error('Welcome template not found');
        }

        // Register subject for the user's language
        this.client.registerSubject('welcome', user.language, template.subject[user.language]);

        const options: TemplateOptions = {
            lang: user.language,
            variables: {
                USER_NAME: user.name,
                USER_EMAIL: user.email,
                ACTIVATION_LINK: activationLink
            }
        };

        const compiled = this.client.compileMail('welcome', options);

        return this.client.send({
            to: user.email,
            subject: compiled.subject,
            html: compiled.html
        });
    }

    // Type-safe method to send password reset email
    async sendPasswordResetEmail(user: User, resetLink: string): Promise<SendResult> {
        const template = this.templates.get('password-reset');
        if (!template) {
            throw new Error('Password reset template not found');
        }

        this.client.registerSubject('password-reset', user.language, template.subject[user.language]);

        const options: TemplateOptions = {
            lang: user.language,
            variables: {
                USER_NAME: user.name,
                RESET_LINK: resetLink,
                EXPIRY_TIME: '24 hours'
            }
        };

        const compiled = this.client.compileMail('password-reset', options);

        return this.client.send({
            to: user.email,
            subject: compiled.subject,
            html: compiled.html
        });
    }

    // Type-safe bulk email sending
    async sendBulkWelcomeEmails(users: User[], activationLinks: Record<string, string>): Promise<BulkSendResult[]> {
        const results: BulkSendResult[] = [];

        for (const user of users) {
            try {
                const activationLink = activationLinks[user.id];
                if (!activationLink) {
                    results.push({
                        recipient: user.email,
                        success: false,
                        error: 'No activation link provided'
                    });
                    continue;
                }

                const result = await this.sendWelcomeEmail(user, activationLink);
                results.push({
                    recipient: user.email,
                    ...result
                });
            } catch (error) {
                results.push({
                    recipient: user.email,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return results;
    }

    // Type-safe provider configuration
    async setupProvider(providerName: string, credentials: { user: string; pass: string }): Promise<void> {
        const setup = getProviderSetup(providerName);
        console.log(`Setting up ${providerName}:`);
        console.log(`Documentation: ${setup.docs}`);
        console.log(`Notes: ${setup.notes}`);
        console.log(`Requires App Password: ${setup.requiresAppPassword}`);
        console.log('Setup steps:');
        setup.setupSteps.forEach(step => console.log(`  ${step}`));

        const options: ProviderOptions = {
            pool: true,
            maxConnections: 5,
            maxMessages: 10,
            rateLimit: 10,
            tls: {
                rejectUnauthorized: true
            }
        };

        const config = createProviderConfig(providerName, credentials, options);
        console.log('Generated configuration:', config);
    }

    // Type-safe configuration testing
    async testConfiguration(): Promise<void> {
        const config = await this.client.testConfiguration();

        console.log('Configuration Test Results:');
        console.log(`✅ SMTP Connection: ${config.smtp ? 'Working' : 'Failed'}`);
        console.log(`✅ DKIM Signing: ${config.dkim ? 'Enabled' : 'Disabled'}`);
        console.log(`📧 Default Sender: ${config.sender}`);
        console.log(`🌐 Default Language: ${config.defaultLang}`);
        console.log(`🔗 SMTP Host: ${config.host}:${config.port} (${config.secure ? 'Secure' : 'Insecure'})`);
    }
}

// Example usage with full type safety
async function advancedExample() {
    // Create typed email service
    const emailService = new TypedEmailService({
        defaultFrom: 'noreply@myapp.com',
        defaultLang: 'en',
        defaults: {
            APP_NAME: 'My Typed App',
            APP_URL: 'https://myapp.com',
            SUPPORT_EMAIL: 'support@myapp.com'
        }
    });

    // Sample users with proper typing
    const users: User[] = [
        {
            id: '1',
            email: 'john@example.com',
            name: 'John Doe',
            language: 'en'
        },
        {
            id: '2',
            email: 'marie@example.com',
            name: 'Marie Dupont',
            language: 'fr'
        },
        {
            id: '3',
            email: 'carlos@example.com',
            name: 'Carlos Rodriguez',
            language: 'es'
        }
    ];

    // Sample activation links
    const activationLinks: Record<string, string> = {
        '1': 'https://myapp.com/activate?token=abc123',
        '2': 'https://myapp.com/activate?token=def456',
        '3': 'https://myapp.com/activate?token=ghi789'
    };

    try {
        console.log('🚀 Testing advanced TypeScript features...\n');

        // Test configuration
        await emailService.testConfiguration();
        console.log('\n');

        // Send individual welcome emails
        console.log('📧 Sending individual welcome emails...');
        for (const user of users) {
            const result = await emailService.sendWelcomeEmail(user, activationLinks[user.id]);
            console.log(`${result.success ? '✅' : '❌'} Welcome email to ${user.email}: ${result.success ? 'Sent' : result.error}`);
        }

        console.log('\n');

        // Send bulk welcome emails
        console.log('📧 Sending bulk welcome emails...');
        const bulkResults = await emailService.sendBulkWelcomeEmails(users, activationLinks);
        bulkResults.forEach(result => {
            console.log(`${result.success ? '✅' : '❌'} Bulk email to ${result.recipient}: ${result.success ? 'Sent' : result.error}`);
        });

        console.log('\n');

        // Setup provider example
        console.log('⚙️ Provider setup example:');
        await emailService.setupProvider('gmail', {
            user: 'your-email@gmail.com',
            pass: 'your-app-password'
        });

    } catch (error) {
        console.error('❌ Advanced example failed:', error);
    }
}

// Run the advanced example
async function main() {
    await advancedExample();
}

// Uncomment to run
// main();
