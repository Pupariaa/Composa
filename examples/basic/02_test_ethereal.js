import { EmailClient, defaultSubjects, createTestConfig } from "composa";

async function run() {
	const testMailer = new EmailClient({
		defaultLang: "fr",
		subjects: defaultSubjects,
		defaults: {
			APP_URL: "https://yourapp.com",
			APP_NAME: "Your App Name",
			SUPPORT_EMAIL: "support@yourapp.com",
		},
		transport: createTestConfig("test@ethereal.email", "test-password"),
	});

	const { html, subject } = testMailer.compileMail("password-reset", {
		lang: "fr",
		variables: {
			USER_NAME: "Utilisateur Test",
			USER_EMAIL: "test@example.com",
			RESET_URL: "https://yourapp.com/reset/test123",
			EXPIRATION_TIME: "1 heure",
		},
	});

	const result = await testMailer.sendMail({
		to: "test@example.com",
		html,
		subject,
	});
	console.log("Test mailer result:", result);
}

run();
