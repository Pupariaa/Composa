/**
 * TypeScript example for email provider configuration
 * This example shows how to configure different email providers with full type safety
 */

import {
    EmailClient,
    createGmailConfig,
    createYahooConfig,
    createAOLConfig,
    createGMXConfig,
    createZohoConfig,
    createiCloudConfig,
    createProviderConfig,
    getProviderSetup,
    listProviders,
    type EmailClientOptions,
    type ProviderOptions,
    type ProviderCredentials
} from 'composa';

// Type-safe provider configuration interface
interface ProviderConfig {
    name: string;
    credentials: ProviderCredentials;
    options?: ProviderOptions;
}

// Type-safe email service with provider management
class TypedProviderService {
    private client: EmailClient | null = null;
    private currentProvider: string | null = null;

    // List all available providers with type safety
    listAvailableProviders(): string[] {
        return listProviders();
    }

    // Get provider setup information with type safety
    getProviderInfo(providerName: string) {
        return getProviderSetup(providerName);
    }

    // Configure Gmail with type safety
    configureGmail(email: string, appPassword: string, options?: ProviderOptions): void {
        const config = createGmailConfig(email, appPassword);
        this.setupClient(config, 'gmail');
    }

    // Configure Yahoo with type safety
    configureYahoo(email: string, appPassword: string, options?: ProviderOptions): void {
        const config = createYahooConfig(email, appPassword);
        this.setupClient(config, 'yahoo');
    }

    // Configure AOL with type safety
    configureAOL(email: string, appPassword: string, options?: ProviderOptions): void {
        const config = createAOLConfig(email, appPassword);
        this.setupClient(config, 'aol');
    }

    // Configure GMX with type safety
    configureGMX(email: string, password: string, options?: ProviderOptions): void {
        const config = createGMXConfig(email, password);
        this.setupClient(config, 'gmx');
    }

    // Configure Zoho with type safety
    configureZoho(email: string, password: string, options?: ProviderOptions): void {
        const config = createZohoConfig(email, password);
        this.setupClient(config, 'zoho');
    }

    // Configure iCloud with type safety
    configureiCloud(email: string, appPassword: string, options?: ProviderOptions): void {
        const config = createiCloudConfig(email, appPassword);
        this.setupClient(config, 'icloud');
    }

    // Generic provider configuration with type safety
    configureProvider(providerName: string, credentials: ProviderCredentials, options?: ProviderOptions): void {
        const config = createProviderConfig(providerName, credentials, options);
        this.setupClient(config, providerName);
    }

    // Setup email client with configuration
    private setupClient(transportConfig: any, providerName: string): void {
        const clientOptions: EmailClientOptions = {
            defaultFrom: transportConfig.from || 'noreply@example.com',
            defaultLang: 'en',
            defaults: {
                APP_NAME: 'My App',
                APP_URL: 'https://myapp.com',
                SUPPORT_EMAIL: 'support@myapp.com'
            },
            transporter: transportConfig
        };

        this.client = new EmailClient(clientOptions);
        this.currentProvider = providerName;
    }

    // Test current configuration
    async testCurrentConfiguration(): Promise<void> {
        if (!this.client) {
            throw new Error('No provider configured. Please configure a provider first.');
        }

        const config = await this.client.testConfiguration();

        console.log(`\n🔧 Configuration Test for ${this.currentProvider}:`);
        console.log(`✅ SMTP Connection: ${config.smtp ? 'Working' : 'Failed'}`);
        console.log(`✅ DKIM Signing: ${config.dkim ? 'Enabled' : 'Disabled'}`);
        console.log(`📧 Default Sender: ${config.sender}`);
        console.log(`🌐 Default Language: ${config.defaultLang}`);
        console.log(`🔗 SMTP Host: ${config.host}:${config.port} (${config.secure ? 'Secure' : 'Insecure'})`);
    }

    // Send test email
    async sendTestEmail(to: string): Promise<void> {
        if (!this.client) {
            throw new Error('No provider configured. Please configure a provider first.');
        }

        const result = await this.client.send({
            to,
            subject: 'Test Email from Composa TypeScript',
            html: `
        <h1>Test Email</h1>
        <p>This is a test email sent using Composa with TypeScript support.</p>
        <p>Provider: ${this.currentProvider}</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `
        });

        if (result.success) {
            console.log(`✅ Test email sent successfully to ${to}`);
            console.log(`📧 Message ID: ${result.messageId}`);
        } else {
            console.log(`❌ Failed to send test email: ${result.error}`);
        }
    }

    // Get current provider
    getCurrentProvider(): string | null {
        return this.currentProvider;
    }
}

// Example usage with different providers
async function providerConfigurationExample() {
    const service = new TypedProviderService();

    console.log('🚀 TypeScript Provider Configuration Example\n');

    // List available providers
    console.log('📋 Available providers:');
    const providers = service.listAvailableProviders();
    providers.forEach(provider => {
        console.log(`  - ${provider}`);
    });

    console.log('\n');

    // Example 1: Gmail configuration
    console.log('📧 Gmail Configuration Example:');
    try {
        const gmailInfo = service.getProviderInfo('gmail');
        console.log(`Documentation: ${gmailInfo.docs}`);
        console.log(`Notes: ${gmailInfo.notes}`);
        console.log(`Requires App Password: ${gmailInfo.requiresAppPassword}`);
        console.log('Setup steps:');
        gmailInfo.setupSteps.forEach(step => console.log(`  ${step}`));

        // Configure Gmail (replace with your actual credentials)
        // service.configureGmail('your-email@gmail.com', 'your-app-password');
        // await service.testCurrentConfiguration();
        // await service.sendTestEmail('test@example.com');
    } catch (error) {
        console.log(`❌ Gmail configuration failed: ${error}`);
    }

    console.log('\n');

    // Example 2: Yahoo configuration
    console.log('📧 Yahoo Configuration Example:');
    try {
        const yahooInfo = service.getProviderInfo('yahoo');
        console.log(`Documentation: ${yahooInfo.docs}`);
        console.log(`Notes: ${yahooInfo.notes}`);
        console.log(`Requires App Password: ${yahooInfo.requiresAppPassword}`);

        // Configure Yahoo (replace with your actual credentials)
        // service.configureYahoo('your-email@yahoo.com', 'your-app-password');
        // await service.testCurrentConfiguration();
    } catch (error) {
        console.log(`❌ Yahoo configuration failed: ${error}`);
    }

    console.log('\n');

    // Example 3: Generic provider configuration
    console.log('📧 Generic Provider Configuration Example:');
    try {
        const credentials: ProviderCredentials = {
            user: 'your-email@example.com',
            pass: 'your-password'
        };

        const options: ProviderOptions = {
            pool: true,
            maxConnections: 5,
            maxMessages: 10,
            rateLimit: 10,
            tls: {
                rejectUnauthorized: true
            },
            dkim: {
                domainName: 'example.com',
                keySelector: 'default',
                privateKey: 'your-dkim-private-key'
            }
        };

        // Configure generic provider (replace with your actual provider)
        // service.configureProvider('gmail', credentials, options);
        // await service.testCurrentConfiguration();
    } catch (error) {
        console.log(`❌ Generic provider configuration failed: ${error}`);
    }

    console.log('\n');

    // Example 4: Advanced configuration with custom options
    console.log('📧 Advanced Configuration Example:');
    try {
        const advancedOptions: ProviderOptions = {
            pool: true,
            maxConnections: 10,
            maxMessages: 20,
            rateLimit: 5,
            connectionTimeout: 30000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
            tls: {
                rejectUnauthorized: true,
                ciphers: ['HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA']
            },
            debug: true,
            logger: true
        };

        console.log('Advanced options configured:');
        console.log(`  - Connection pooling: ${advancedOptions.pool}`);
        console.log(`  - Max connections: ${advancedOptions.maxConnections}`);
        console.log(`  - Max messages: ${advancedOptions.maxMessages}`);
        console.log(`  - Rate limit: ${advancedOptions.rateLimit} emails/second`);
        console.log(`  - TLS security: ${advancedOptions.tls?.rejectUnauthorized ? 'Strict' : 'Relaxed'}`);
        console.log(`  - Debug mode: ${advancedOptions.debug ? 'Enabled' : 'Disabled'}`);

    } catch (error) {
        console.log(`❌ Advanced configuration failed: ${error}`);
    }
}

// Run the provider configuration example
async function main() {
    await providerConfigurationExample();
}

// Uncomment to run
// main();
