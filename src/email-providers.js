/**
 * Email Provider Presets for Composa
 *
 * This module contains pre-configured settings for popular email providers
 * to make SMTP setup easier and more reliable.
 */

/**
 * Popular email provider configurations
 * Each preset includes the standard SMTP settings for the provider
 */
export const emailProviders = {
	// Google Gmail
	gmail: {
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		requiresAuth: true,
		authType: "login",
		docs: "https://support.google.com/mail/answer/7126229",
		notes: "Use App Password instead of regular password. Enable 2FA first.",
	},


	// Yahoo Mail
	yahoo: {
		host: "smtp.mail.yahoo.com",
		port: 587,
		secure: false,
		requiresAuth: true,
		authType: "login",
		docs: "https://help.yahoo.com/kb/SLN4724.html",
		notes: "Requires App Password. Enable 2-step verification first.",
	},

	// AOL Mail
	aol: {
		host: "smtp.aol.com",
		port: 587,
		secure: false,
		requiresAuth: true,
		authType: "login",
		docs: "https://help.aol.com/articles/how-to-set-up-aol-mail-in-another-mail-client",
		notes: "Requires App Password. Enable 2-step verification first.",
	},

	// GMX Mail
	gmx: {
		host: "mail.gmx.com",
		port: 587,
		secure: false,
		requiresAuth: true,
		authType: "login",
		docs: "https://support.gmx.com/pages/viewpage.action?pageId=18866728",
		notes: "Use your GMX email and password. May require App Password for 2FA accounts.",
	},

	// Zoho Mail
	zoho: {
		host: "smtp.zoho.com",
		port: 587,
		secure: false,
		requiresAuth: true,
		authType: "login",
		docs: "https://www.zoho.com/mail/help/zoho-mail-smtp-configuration.html",
		notes: "Use your Zoho email and password. Enable IMAP access in settings.",
	},

	// Apple iCloud Mail
	icloud: {
		host: "smtp.mail.me.com",
		port: 587,
		secure: false,
		requiresAuth: true,
		authType: "login",
		docs: "https://support.apple.com/en-us/102654",
		notes: "Requires App Password. Enable 2FA first on your Apple ID.",
	},

	// Microsoft Outlook
	outlook: {
		host: "smtp-mail.outlook.com",
		port: 587,
		secure: false,
		requiresAuth: true,
		authType: "login",
		docs: "https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-for-outlook-com-d088b986-291d-42b8-9564-9c414e2aa040",
		notes: "Use your Outlook email and password. May require App Password for 2FA accounts.",
	},

};

/**
 * Get provider configuration by name
 * @param {string} providerName - Name of the email provider
 * @returns {object} Provider configuration object
 */
export function getProvider(providerName) {
	if (typeof providerName !== "string") {
		throw new Error(
			`Invalid provider name: expected string, got ${typeof providerName}`,
		);
	}
	const provider = emailProviders[providerName.toLowerCase()];
	if (!provider) {
		throw new Error(
			`Unknown email provider: ${providerName}. Available providers: ${Object.keys(emailProviders).join(", ")}`,
		);
	}
	return { ...provider };
}

/**
 * Create transport configuration for a specific provider
 * @param {string} providerName - Name of the email provider
 * @param {object} credentials - Authentication credentials
 * @param {string} credentials.user - Username/email
 * @param {string} credentials.pass - Password/API key
 * @param {object} options - Additional options
 * @param {object} options.dkim - DKIM configuration
 * @param {string} options.dkim.domainName - Domain name for DKIM signing
 * @param {string} options.dkim.keySelector - DKIM key selector
 * @param {string} options.dkim.privateKey - DKIM private key (PEM format)
 * @param {object} options.tls - TLS configuration
 * @param {boolean} options.tls.rejectUnauthorized - Reject unauthorized certificates
 * @param {Array} options.tls.ciphers - Allowed ciphers
 * @param {string} options.from - Default from address
 * @param {number} options.pool - Use connection pooling
 * @param {number} options.maxConnections - Max concurrent connections
 * @param {number} options.maxMessages - Max messages per connection
 * @returns {object} Nodemailer transport configuration
 */
export function createProviderConfig(
	providerOrConfig,
	credentials,
	options = {},
) {
	let config;

	// Flexible API: accept a full transport config object as first argument
	if (
		providerOrConfig &&
		typeof providerOrConfig === "object" &&
		providerOrConfig.host
	) {
		config = { ...providerOrConfig };
	} else {
		const providerName = providerOrConfig;
		const provider = getProvider(providerName);
		if (!credentials || !credentials.user || !credentials.pass) {
			throw new Error(
				`Missing credentials for ${providerName}. Required: user, pass`,
			);
		}
		config = {
			host: provider.host,
			port: options.port || provider.port,
			secure:
				options.secure !== undefined ? options.secure : provider.secure,
			auth: {
				user: provider.username || credentials.user,
				pass: credentials.pass,
			},
		};
	}

	// Connection options
	if (options.connectionTimeout)
		config.connectionTimeout = options.connectionTimeout;
	if (options.greetingTimeout)
		config.greetingTimeout = options.greetingTimeout;
	if (options.socketTimeout) config.socketTimeout = options.socketTimeout;

	// TLS Security options
	if (options.tls) {
		config.tls = {
			rejectUnauthorized: options.tls.rejectUnauthorized !== false, // Default to true
			...(config.tls || {}),
			...options.tls,
		};
	}

	// Connection pooling
	if (options.pool !== undefined) config.pool = options.pool;
	if (options.maxConnections) config.maxConnections = options.maxConnections;
	if (options.maxMessages) config.maxMessages = options.maxMessages;

	// Rate limiting
	if (options.rateLimit) config.rateLimit = options.rateLimit;

	// DKIM Signing
	if (options.dkim && options.dkim.domainName && options.dkim.privateKey) {
		config.dkim = {
			domainName: options.dkim.domainName,
			keySelector: options.dkim.keySelector || "default",
			privateKey: options.dkim.privateKey,
			...(config.dkim || {}),
			...options.dkim,
		};
	}

	// Default from address
	if (options.from) config.from = options.from;

	// Proxy support
	if (options.proxy) config.proxy = options.proxy;

	// Logger
	if (options.logger !== undefined) config.logger = options.logger;
	if (options.debug !== undefined) config.debug = options.debug;

	return config;
}

/**
 * Simplified helper functions for popular providers
 */

/**
 * Create Gmail configuration - requires App Password
 * @param {string} email - Your Gmail address
 * @param {string} appPassword - Gmail App Password (not your regular password)
 * @returns {object} Gmail transport configuration
 */
export function createGmailConfig(email, appPassword) {
	return createProviderConfig("gmail", { user: email, pass: appPassword });
}

/**
 * Create Outlook configuration
 * @param {string} email - Your Outlook email address
 * @param {string} password - Your Outlook password or App Password
 * @returns {object} Outlook transport configuration
 */
export function createOutlookConfig(email, password) {
	return createProviderConfig("outlook", { user: email, pass: password });
}


/**
 * Create Yahoo configuration - requires App Password
 * @param {string} email - Your Yahoo email address
 * @param {string} appPassword - Yahoo App Password
 * @returns {object} Yahoo transport configuration
 */
export function createYahooConfig(email, appPassword) {
	return createProviderConfig("yahoo", { user: email, pass: appPassword });
}

/**
 * Create AOL configuration
 * @param {string} email - Your AOL email address
 * @param {string} appPassword - Your AOL App Password
 * @returns {object} AOL transport configuration
 */
export function createAOLConfig(email, appPassword) {
	return createProviderConfig("aol", { user: email, pass: appPassword });
}

/**
 * Create GMX configuration
 * @param {string} email - Your GMX email address
 * @param {string} password - Your GMX password or App Password
 * @returns {object} GMX transport configuration
 */
export function createGMXConfig(email, password) {
	return createProviderConfig("gmx", { user: email, pass: password });
}

/**
 * Create Zoho configuration
 * @param {string} email - Your Zoho email address
 * @param {string} password - Your Zoho password
 * @returns {object} Zoho transport configuration
 */
export function createZohoConfig(email, password) {
	return createProviderConfig("zoho", { user: email, pass: password });
}

/**
 * Create iCloud configuration
 * @param {string} email - Your iCloud email address
 * @param {string} appPassword - Your iCloud App Password
 * @returns {object} iCloud transport configuration
 */
export function createiCloudConfig(email, appPassword) {
	return createProviderConfig("icloud", { user: email, pass: appPassword });
}


/**
 * Create test configuration (Ethereal Email)
 * @returns {object} Test transport configuration
 */
export function createTestConfig() {
	return {
		host: "smtp.ethereal.email",
		port: 587,
		secure: false,
		auth: {
			user: "ethereal.user@ethereal.email",
			pass: "ethereal.pass"
		}
	};
}

/**
 * Get setup instructions for a provider
 * @param {string} providerName - Name of the email provider
 * @returns {object} Setup instructions with docs and notes
 */
export function getProviderSetup(providerName) {
	const provider = getProvider(providerName);
	return {
		provider: providerName,
		docs: provider.docs,
		notes: provider.notes,
		requiresAppPassword: ["gmail", "yahoo", "aol", "zoho", "icloud"].includes(
			providerName.toLowerCase(),
		),
		setupSteps: getSetupSteps(providerName.toLowerCase()),
	};
}

function getSetupSteps(providerName) {
	const steps = {
		gmail: [
			"1. Enable 2-Factor Authentication on your Google account",
			"2. Go to Google Account settings > Security > 2-Step Verification",
			"3. Generate an 'App Password' for 'Mail'",
			"4. Use your Gmail address and the App Password (not your regular password)",
		],
		yahoo: [
			"1. Enable 2-Step Verification in Yahoo Account Security",
			"2. Go to Account Info > Account Security > Generate app password",
			"3. Select 'Other app' and name it (e.g., 'My App')",
			"4. Use your Yahoo email and the generated App Password",
		],
		aol: [
			"1. Enable 2-Step Verification on your AOL account",
			"2. Go to Account Security > Two-step verification",
			"3. Generate an App Password for your application",
			"4. Use your AOL email and the App Password",
		],
		gmx: [
			"1. Go to GMX Account > Security Options",
			"2. Enable Two-factor authentication if available",
			"3. Generate Application-specific passwords if 2FA is enabled",
			"4. Use your GMX email and password (or App Password if 2FA enabled)",
		],
		zoho: [
			"1. Enable 2-Factor Authentication on your Zoho account",
			"2. Go to Security > Two-Factor Authentication",
			"3. Generate an App Password for your application",
			"4. Ensure IMAP access is enabled in Mail settings",
			"5. Use your Zoho email and the App Password",
		],
		icloud: [
			"1. Enable 2-Factor Authentication on your Apple ID",
			"2. Go to Apple ID settings > Sign-In and Security",
			"3. Generate an App-Specific Password",
			"4. Use your iCloud email and the App Password",
		],
	};

	return (
		steps[providerName] || [
			"1. Check the provider's documentation for SMTP settings",
			"2. Create API credentials or App Password if required",
			"3. Use the credentials with createProviderConfig()",
		]
	);
}

/**
 * List all available providers
 * @returns {Array<string>} Array of provider names
 */
export function listProviders() {
	return Object.keys(emailProviders).sort();
}

/**
 * Get provider documentation URL
 * @param {string} providerName - Name of the email provider
 * @returns {string} Documentation URL
 */
export function getProviderDocs(providerName) {
	const provider = getProvider(providerName);
	return provider.docs;
}

/**
 * Get provider setup notes
 * @param {string} providerName - Name of the email provider
 * @returns {string} Setup notes and tips
 */
export function getProviderNotes(providerName) {
	const provider = getProvider(providerName);
	return provider.notes;
}
