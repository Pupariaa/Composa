/**
 * Basic Usage Example for Composa
 * 
 * This example shows how to:
 * - Configure the EmailClient with simplified provider setup
 * - Send a password reset email in French
 * - Handle the response
 */

import { EmailClient, defaultSubjects, createGmailConfig, createTestConfig } from 'composa';

// Method 1: Gmail setup (Easy)
const gmailMailer = new EmailClient({
  defaultLang: 'fr',
  subjects: defaultSubjects,
  defaults: { 
    APP_URL: 'https://yourapp.com',
    APP_NAME: 'Your App Name',
    SUPPORT_EMAIL: 'support@yourapp.com'
  },
  transport: createGmailConfig('your-email@gmail.com', 'your-app-password')
});

// Method 2: Test setup (for development - safe!)
const testMailer = new EmailClient({
  defaultLang: 'fr', 
  subjects: defaultSubjects,
  defaults: { 
    APP_URL: 'https://yourapp.com',
    APP_NAME: 'Your App Name',
    SUPPORT_EMAIL: 'support@yourapp.com'
  },
  transport: createTestConfig('test@ethereal.email', 'test-password')
});

// Example 1: Send real email with Gmail
async function sendPasswordResetWithGmail() {
  try {
    const result = await gmailMailer.sendTemplate({
      to: 'user@example.com',
      template: 'password-reset',
      lang: 'fr',
      variables: {
        USER_NAME: 'Jean Dupont',
        USER_EMAIL: 'user@example.com',
        RESET_URL: 'https://yourapp.com/reset/abc123def456',
        EXPIRATION_TIME: '24 heures'
      }
    });

    console.log('Mail sended with Gmail:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending email with Gmail:', error.message);
    throw error;
  }
}

// Example 2: Safe testing (emails caught, not delivered)
async function testEmailWithEthereal() {
  try {
    const result = await testMailer.sendTemplate({
      to: 'test@example.com',
      template: 'password-reset',
      lang: 'fr',
      variables: {
        USER_NAME: 'Utilisateur Test',
        USER_EMAIL: 'test@example.com',
        RESET_URL: 'https://yourapp.com/reset/test123',
        EXPIRATION_TIME: '1 heure'
      }
    });
    return result;
  } catch (error) {
    console.error('❌ Test échoué:', error.message);
    throw error;
  }
}

// Example 3: Mock transporter for unit tests
async function testWithMockTransporter() {
  const mockTransporter = {
    sendMail: async (mailOptions) => {
      console.log('Mock - Email to:', mailOptions.to);
      console.log('Mock - Subjet:', mailOptions.subject);
      console.log('Mock - HTML Size:', mailOptions.html?.length || 0, 'caractères');
      return { messageId: 'mock-123', response: 'Mock OK' };
    },
    verify: async () => true
  };

  const mockMailer = new EmailClient({
    defaultLang: 'fr',
    subjects: defaultSubjects,
    defaults: { APP_URL: 'https://example.com' },
    transporter: mockTransporter
  });

  const result = await mockMailer.sendTemplate({
    to: 'mock@example.com',
    template: 'password-reset',
    lang: 'fr',
    variables: {
      USER_NAME: 'Mock User',
      USER_EMAIL: 'mock@example.com',
      RESET_URL: 'https://example.com/reset/mock123',
      EXPIRATION_TIME: '1 hour'
    }
  });

  console.log('Mock mailer result:', result);
}

// Run examples
console.log('Examples Composa - Simple providers\n');

console.log('1. Test with Mock Transporter (sûr):');
await testWithMockTransporter();

console.log('\n2. Test with Ethereal:)');
// await testEmailWithEthereal();

console.log('\n3. Send real email with Gmail:');
// await sendPasswordResetWithGmail();

console.log('\n Finished! Have a nice day!');