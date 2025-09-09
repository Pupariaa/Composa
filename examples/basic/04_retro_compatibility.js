import { EmailClient, TemplateEngine, defaultSubjects } from "composa";

async function testRetroCompatibility() {
	console.log("Testing Retro-compatibility with Composa\n");

	const mockTransporter = {
		sendMail: async (mailOptions) => {
			console.log("Mock - Email to:", mailOptions.to);
			console.log("Mock - Subject:", mailOptions.subject);
			console.log(
				"Mock - HTML size:",
				mailOptions.html?.length || 0,
				"characters",
			);
			return { messageId: "mock-123", response: "Mock OK" };
		},
		verify: async () => true,
	};

	const mailer = new EmailClient({
		defaultLang: "fr",
		subjects: defaultSubjects,
		defaults: { APP_URL: "https://example.com" },
		transporter: mockTransporter,
	});

	// Test 1: Old sendTemplate method (deprecated but working)
	console.log("1. Testing old sendTemplate method:");
	try {
		const result1 = await mailer.sendTemplate({
			to: "user@example.com",
			template: "password-reset",
			lang: "fr",
			variables: {
				USER_NAME: "Jean Dupont",
				USER_EMAIL: "user@example.com",
				RESET_URL: "https://example.com/reset/token123",
				EXPIRATION_TIME: "24 heures",
			},
		});
		console.log("sendTemplate result:", result1);
	} catch (error) {
		console.error("sendTemplate failed:", error.message);
	}

	// Test 2: Old render method (deprecated but working)
	console.log("\n2. Testing old render method:");
	try {
		const html = await mailer.render(
			"password-reset",
			{
				USER_NAME: "Jean Dupont",
				USER_EMAIL: "user@example.com",
				RESET_URL: "https://example.com/reset/token123",
				EXPIRATION_TIME: "24 heures",
			},
			"fr",
		);
		console.log("render result length:", html.length, "characters");
	} catch (error) {
		console.error("render failed:", error.message);
	}

	// Test 3: Standalone TemplateEngine (retro-compatibility)
	console.log("\n3. Testing standalone TemplateEngine:");
	try {
		const engine = new TemplateEngine({
			defaultLang: "fr",
			defaults: { APP_NAME: "TestApp" },
		});

		const html = engine.render("password-reset", {
			USER_NAME: "Jean Dupont",
			USER_EMAIL: "user@example.com",
			RESET_URL: "https://example.com/reset/token123",
			EXPIRATION_TIME: "24 heures",
		});
		console.log("TemplateEngine result length:", html.length, "characters");
	} catch (error) {
		console.error("TemplateEngine failed:", error.message);
	}

	// Test 4: New API (preferred)
	console.log("\n4. Testing new API (preferred):");
	try {
		const { html, subject } = mailer.compileMail("password-reset", {
			lang: "fr",
			variables: {
				USER_NAME: "Jean Dupont",
				USER_EMAIL: "user@example.com",
				RESET_URL: "https://example.com/reset/token123",
				EXPIRATION_TIME: "24 heures",
			},
		});

		const result4 = await mailer.sendMail({
			to: "user@example.com",
			html,
			subject,
		});
		console.log("New API result:", result4);
	} catch (error) {
		console.error("New API failed:", error.message);
	}

	console.log("\netro-compatibility test completed!");
	console.log("\nMigration recommendations:");
	console.log(
		"   - Use compileMail() + sendMail() instead of sendTemplate()",
	);
	console.log("   - Use compileTemplate() instead of render()");
	console.log("   - Use EmailClient methods instead of TemplateEngine");
}

testRetroCompatibility().catch(console.error);
