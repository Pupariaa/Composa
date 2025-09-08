import { EmailClient, defaultSubjects } from 'composa';

async function run() {
    const mockTransporter = {
        sendMail: async (mailOptions) => {
            console.log('Mock - Email to:', mailOptions.to);
            console.log('Mock - Subject:', mailOptions.subject);
            console.log('Mock - HTML size:', mailOptions.html?.length || 0);
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

    const { html, subject } = mockMailer.compileMail('password-reset', {
        lang: 'fr',
        variables: { USER_NAME: 'Mock User', USER_EMAIL: 'mock@example.com', RESET_URL: 'https://example.com/reset/mock123', EXPIRATION_TIME: '1 hour' }
    });

    const result = await mockMailer.sendMail({ to: 'mock@example.com', html, subject });
    console.log('Mock mailer result:', result);
}

run();
