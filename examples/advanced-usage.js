/**
 * Advanced Usage Example for Composa
 * 
 * This example demonstrates:
 * - Multiple provider configurations  
 * - Bulk email sending with different providers
 * - Custom subjects registration
 * - Multiple templates and languages
 * - Error handling and retry logic
 * - Provider-specific optimizations
 */

import { 
  EmailClient, 
  defaultSubjects, 
  createGmailConfig,
  createSendGridConfig,
  createOutlookConfig,
  getProviderSetup
} from 'composa';

// Setup multiple providers for different use cases
const providers = {
  // Gmail for personal/internal emails
  gmail: new EmailClient({
    defaultLang: 'fr',
    subjects: defaultSubjects,
    defaults: {
      APP_NAME: 'MonApp',
      APP_URL: 'https://monapp.com',
      SUPPORT_EMAIL: 'support@monapp.com'
    },
    transport: createGmailConfig('internal@monapp.com', 'gmail-app-password')
  }),

  // SendGrid for bulk marketing emails
  sendgrid: new EmailClient({
    defaultLang: 'en',
    subjects: defaultSubjects, 
    defaults: {
      APP_NAME: 'MyApp',
      APP_URL: 'https://myapp.com',
      SUPPORT_EMAIL: 'support@myapp.com',
      COMPANY_NAME: 'MyApp Inc.'
    },
    transport: createSendGridConfig('SG.your-sendgrid-api-key')
  }),

  // Outlook for customer service
  outlook: new EmailClient({
    defaultLang: 'en',
    subjects: defaultSubjects,
    defaults: {
      APP_NAME: 'MyApp Support',
      APP_URL: 'https://myapp.com',
      SUPPORT_EMAIL: 'help@myapp.com'
    },
    transport: createOutlookConfig('help@myapp.com', 'outlook-password')
  }),

  // Mock for testing
  mock: new EmailClient({
    defaultLang: 'en',
    subjects: defaultSubjects,
    defaults: {
      APP_NAME: 'TestApp',
      APP_URL: 'https://test.com'
    },
    transporter: {
      sendMail: async (mailOptions) => {
        console.log(`Mock envoyé à: ${mailOptions.to}`);
        console.log(`Sujet: ${mailOptions.subject}`);
        
        // Simulate failures for retry demos
        if (Math.random() < 0.2) {
          throw new Error('Mock error simulated');
        }
        
        return { 
          messageId: `mock-${Date.now()}`,
          response: 'Mock OK'
        };
      },
      verify: async () => true
    }
  })
};

// Register custom subjects for multiple languages on all providers
Object.values(providers).forEach(mailer => {
  mailer.registerSubjects('welcome-onboarding', {
    'en': 'Welcome to {{APP_NAME}} - Let\'s get started!',
    'fr': 'Bienvenue sur {{APP_NAME}} - Commençons !',
    'es': '¡Bienvenido a {{APP_NAME}} - ¡Empecemos!'
  });

  mailer.registerSubjects('monthly-newsletter', {
    'en': '{{APP_NAME}} Monthly Update - {{MONTH}} {{YEAR}}',
    'fr': 'Actualités {{APP_NAME}} - {{MONTH}} {{YEAR}}',
    'es': 'Actualización mensual de {{APP_NAME}} - {{MONTH}} {{YEAR}}'
  });
});

// Demonstrate provider-specific bulk sending
async function demonstrateProviderSpecificEmails() {
  console.log('Demonstrating provider-specific bulk sending\n');

  const scenarios = [
    {
      name: 'Internal emails with Gmail',
      provider: 'mock', // use mock instead of gmail for demo
      recipients: [
        { email: 'alice@company.com', name: 'Alice Martin', lang: 'fr' },
        { email: 'bob@company.com', name: 'Bob Durand', lang: 'fr' }
      ],
      template: 'suspicious-login'
    },
    {
      name: 'Marketing with SendGrid', 
      provider: 'mock', // use mock instead of sendgrid for demo
      recipients: [
        { email: 'customer1@example.com', name: 'John Smith', lang: 'en' },
        { email: 'customer2@example.com', name: 'Jane Doe', lang: 'en' }
      ],
      template: 'newsletter-promotion'
    },
    {
      name: 'Support client with Outlook',
      provider: 'mock', // use mock instead of outlook for demo  
      recipients: [
        { email: 'help@example.com', name: 'Support Team', lang: 'en' }
      ],
      template: 'account-creation'
    }
  ];

  const results = [];

  for (const scenario of scenarios) {
    console.log(`📧 ${scenario.name}:`);
    const mailer = providers[scenario.provider];
    
    for (const user of scenario.recipients) {
      try {
        const result = await mailer.sendTemplate({
          to: user.email,
          template: scenario.template,
          lang: user.lang,
          variables: {
            USER_NAME: user.name,
            USER_EMAIL: user.email,
            ACTIVATION_URL: `https://myapp.com/activate/${encodeURIComponent(user.email)}`,
            LOGIN_TIME: new Date().toLocaleString(),
            IP_ADDRESS: '192.168.1.100',
            LOCATION: 'Paris, France',
            SECURE_URL: 'https://myapp.com/security',
            PROMO_CODE: 'WELCOME20',
            PROMO_DISCOUNT: '20%'
          }
        });

        results.push({ 
          scenario: scenario.name,
          user: user.email, 
          success: true, 
          provider: scenario.provider,
          result 
        });
        console.log(`Email sent to ${user.email} (${user.lang})`);
      } catch (error) {
        results.push({ 
          scenario: scenario.name,
          user: user.email, 
          success: false, 
          provider: scenario.provider,
          error: error.message 
        });
        console.error(`Failed to send email to ${user.email}:`, error.message);
      }
    }
    console.log();
  }

  return results;
}

// Demonstrate provider setup instructions
async function demonstrateProviderSetup() {
  console.log('Instructions for setting up popular email providers\n');

  const popularProviders = ['gmail', 'outlook', 'sendgrid', 'mailgun'];

  for (const providerName of popularProviders) {
    try {
      const setup = getProviderSetup(providerName);
      console.log(`${setup.provider.toUpperCase()} Setup:`);
      console.log(`Docs: ${setup.docs}`);
      console.log(`Notes: ${setup.notes}`);
      console.log('Steps:');
      setup.setupSteps.forEach(step => console.log(`   ${step}`));
      console.log();
    } catch (error) {
      console.error(`Error getting setup instructions for ${providerName}:`, error.message);
    }
  }
}

async function demonstrateNewsletterCampaign() {
  console.log('Newsletter campaign demonstration (simulated)\n');

  const subscribers = [
    'alice@example.com',
    'bob@example.com', 
    'charlie@example.com'
  ];

  const currentDate = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  try {
    // Use mock provider for demo (in production, use providers.sendgrid)
    const mockMailer = providers.mock;
    const results = await mockMailer.sendBulk(subscribers, {
      template: 'newsletter-promotion',
      lang: 'en',
      variables: {
        MONTH: monthNames[currentDate.getMonth()],
        YEAR: currentDate.getFullYear(),
        PROMO_CODE: 'NEWSLETTER20',
        PROMO_DISCOUNT: '20%',
        PROMO_EXPIRY: 'end of month'
      }
    });

    console.log('Newsletter campaign results:', results);
    return results;
  } catch (error) {
    console.error('Newsletter campaign failed:', error.message);
    throw error;
  }
}

async function demonstrateRetryLogic() {
  console.log('Demonstrating email sending with retry...\n');

  const mockMailer = providers.mock;

  try {
    const result = await mockMailer.sendWithRetry({
      to: 'retry-test@example.com',
      template: 'suspicious-login',
      lang: 'fr',
      variables: {
        USER_NAME: 'Utilisateur Test',
        LOGIN_TIME: new Date().toLocaleString('fr-FR'),
        IP_ADDRESS: '192.168.1.100',
        LOCATION: 'Paris, France',
        SECURE_URL: 'https://myapp.com/security'
      }
    }, 3); // Max 3 attempts

    console.log('Email send with retry:', result);
    return result;
  } catch (error) {
    console.error('Email sending with retry failed:', error.message);
    throw error;
  }
}

async function demonstrateMultipleTemplates() {
  console.log('\nDemonstrating multiple template types...\n');

  const emailScenarios = [
    {
      type: 'Security Alert',
      template: 'suspicious-login',
      to: 'security@example.com',
      lang: 'en',
      variables: {
        USER_NAME: 'John Doe',
        LOGIN_TIME: '2024-01-15 10:30 AM',
        IP_ADDRESS: '203.0.113.10',
        LOCATION: 'Unknown Location',
        SECURE_URL: 'https://myapp.com/security'
      }
    },
    {
      type: 'Maintenance Notice',
      template: 'scheduled-maintenance',
      to: 'admin@example.com',
      lang: 'fr',
      variables: {
        MAINTENANCE_DATE: '15 janvier 2024',
        MAINTENANCE_TIME: '02:00 - 04:00',
        MAINTENANCE_DURATION: '2 heures',
        STATUS_PAGE: 'https://status.myapp.com'
      }
    },
    {
      type: 'Subscription Confirmation',
      template: 'subscription-confirmation',
      to: 'subscriber@example.com',
      lang: 'en',
      variables: {
        USER_NAME: 'Sarah Wilson',
        USER_EMAIL: 'subscriber@example.com',
        SUBSCRIPTION_TYPE: 'Premium Newsletter',
        UNSUBSCRIBE_URL: 'https://myapp.com/unsubscribe/token123'
      }
    }
  ];

  const results = [];

  for (const scenario of emailScenarios) {
    try {
      console.log(`Sending ${scenario.type}...`);
      
      const result = await mailer.sendTemplate({
        to: scenario.to,
        template: scenario.template,
        lang: scenario.lang,
        variables: scenario.variables
      });

      results.push({
        type: scenario.type,
        success: true,
        messageId: result.messageId
      });
      
      console.log(`${scenario.type} sent successfully`);
    } catch (error) {
      results.push({
        type: scenario.type,
        success: false,
        error: error.message
      });
      
      console.error(`${scenario.type} failed:`, error.message);
    }
  }

  return results;
}

// Main execution
console.log('🚀 Advanced usages with Composa - Simplified providers\n');

try {
  // 1. Show provider setup instructions
  await demonstrateProviderSetup();

  // 2. Run provider-specific demonstrations  
  const providerResults = await demonstrateProviderSpecificEmails();
  
  // 3. Newsletter campaign
  const newsletterResults = await demonstrateNewsletterCampaign();
  
  // 4. Retry logic
  const retryResult = await demonstrateRetryLogic();

} catch (error) {
  console.error('\n❌ Demo échouée:', error.message);
  process.exit(1);
}