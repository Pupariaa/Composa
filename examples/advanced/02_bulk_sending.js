import { EmailClient, defaultSubjects } from 'composa';

const mockMailer = new EmailClient({
    defaultLang: 'en',
    subjects: defaultSubjects,
    defaults: { APP_NAME: 'TestApp', APP_URL: 'https://test.com' },
    transporter: {
        sendMail: async (mailOptions) => {
            console.log(`Mock envoyé à: ${mailOptions.to}`);
            console.log(`Sujet: ${mailOptions.subject}`);
            return { messageId: `mock-${Date.now()}`, response: 'Mock OK' };
        },
        verify: async () => true
    }
});

async function run() {
    const recipients = [
        { email: 'alice@example.com', name: 'Alice', lang: 'en' },
        { email: 'bob@example.com', name: 'Bob', lang: 'en' }
    ];

    const results = [];
    for (const user of recipients) {
        const { html, subject } = mockMailer.compileMail('newsletter-promotion', {
            lang: user.lang,
            variables: { USER_NAME: user.name }
        });

        const res = await mockMailer.sendMail({ to: user.email, html, subject });
        results.push({ user: user.email, success: true, result: res });
    }

    console.log('Bulk sending results:', results);
}

run();
