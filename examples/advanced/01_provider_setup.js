import { getProviderSetup } from "composa";

async function run() {
	const providers = ["gmail", "outlook", "sendgrid", "mailgun"];

	for (const name of providers) {
		try {
			const setup = getProviderSetup(name);
			console.log(`${setup.provider.toUpperCase()} Setup:`);
			console.log("Docs:", setup.docs);
			console.log("Notes:", setup.notes);
			setup.setupSteps.forEach((step) => console.log("  ", step));
			console.log();
		} catch (err) {
			console.error(
				`Error getting setup instructions for ${name}:`,
				err.message,
			);
		}
	}
}

run();
