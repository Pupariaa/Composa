import { EmailClient, defaultSubjects, createGmailConfig } from 'composa';

async function run() {
    const gmailMailer = new EmailClient({
        defaultLang: 'fr',
        subjects: defaultSubjects,
        defaults: { APP_URL: 'https://yourapp.com', APP_NAME: 'Your App Name', SUPPORT_EMAIL: 'support@yourapp.com' },
        transport: createGmailConfig('your-email@gmail.com', 'your-app-password')
    });

    const { html, subject } = gmailMailer.compileMail('password-reset', {
        lang: 'fr',
        variables: { USER_NAME: 'Jean Dupont', USER_EMAIL: 'user@example.com', RESET_URL: 'https://yourapp.com/reset/abc123def456', EXPIRATION_TIME: '24 heures' }
    });

    const result = await gmailMailer.sendMail({ to: 'user@example.com', html, subject });
    console.log('Gmail mailer result:', result);
}

run();
