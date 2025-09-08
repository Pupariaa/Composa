import { EmailClient, defaultSubjects } from 'composa';

const mockMailer = new EmailClient({
    defaultLang: 'en',
    subjects: defaultSubjects,
    defaults: { APP_NAME: 'TestApp', APP_URL: 'https://test.com' },
    transporter: {
        sendMail: async (mailOptions) => {
            if (Math.random() < 0.3) throw new Error('Mock failure');
            return { messageId: `mock-${Date.now()}`, response: 'Mock OK' };
        },
        verify: async () => true
    }
});

async function run() {
    const { html, subject } = mockMailer.compileMail('suspicious-login', { lang: 'en', variables: { USER_NAME: 'Tester', LOGIN_TIME: new Date().toISOString() } });
    const result = await mockMailer.sendWithRetry({ to: 'retry-test@example.com', html, subject }, 3);
    console.log('Retry result:', result);
}

run();
