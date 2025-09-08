import { EmailClient, defaultSubjects } from 'composa';

const mockMailer = new EmailClient({
    defaultLang: 'en',
    subjects: defaultSubjects,
    defaults: { APP_NAME: 'TestApp', APP_URL: 'https://test.com' },
    transporter: {
        sendMail: async (mailOptions) => ({ messageId: `mock-${Date.now()}`, response: 'Mock OK' }),
        verify: async () => true
    }
});

async function run() {
    const subscribers = ['alice@example.com', 'bob@example.com', 'charlie@example.com'];
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const currentYear = new Date().getFullYear();

    const results = [];
    for (const email of subscribers) {
        const { html, subject } = mockMailer.compileMail('newsletter-promotion', {
            lang: 'en',
            variables: { MONTH: currentMonth, YEAR: currentYear, PROMO_CODE: 'NEWSLETTER20', PROMO_DISCOUNT: '20%', PROMO_EXPIRY: 'end of month' }
        });
        const res = await mockMailer.sendMail({ to: email, html, subject });
        results.push({ user: email, success: true, result: res });
    }

    console.log('Newsletter campaign results:', results);
}

run();
