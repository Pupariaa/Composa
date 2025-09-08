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
    const scenarios = [
        { template: 'suspicious-login', to: 'security@example.com', variables: { USER_NAME: 'John', LOGIN_TIME: '2024-01-15 10:30 AM', IP_ADDRESS: '203.0.113.10', LOCATION: 'Unknown' } },
        { template: 'scheduled-maintenance', to: 'admin@example.com', variables: { MAINTENANCE_DATE: '15 Jan', MAINTENANCE_TIME: '02:00-04:00', MAINTENANCE_DURATION: '2 hours' } }
    ];

    for (const s of scenarios) {
        const { html, subject } = mockMailer.compileMail(s.template, { variables: s.variables });
        const res = await mockMailer.sendMail({ to: s.to, html, subject });
        console.log(`Sent ${s.template} to ${s.to}:`, res);
    }
}

run();
