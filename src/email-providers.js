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
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    docs: 'https://support.google.com/mail/answer/7126229',
    notes: 'Use App Password instead of regular password. Enable 2FA first.'
  },

  // Microsoft Outlook/Hotmail
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    docs: 'https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353',
    notes: 'Works with Outlook.com, Hotmail.com, Live.com accounts'
  },

  // Yahoo Mail
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    docs: 'https://help.yahoo.com/kb/SLN4724.html',
    notes: 'Requires App Password. Enable 2-step verification first.'
  },

  // SendGrid
  sendgrid: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    username: 'apikey',
    docs: 'https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api',
    notes: 'Username is always "apikey", password is your SendGrid API key'
  },

  // Mailgun
  mailgun: {
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    docs: 'https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp',
    notes: 'Username format: postmaster@your-domain.mailgun.org'
  },

  // Amazon SES
  ses: {
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    docs: 'https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html',
    notes: 'Requires SMTP credentials (different from AWS access keys). Region-specific host.'
  },

  // Postmark
  postmark: {
    host: 'smtp.postmarkapp.com',
    port: 587,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    docs: 'https://postmarkapp.com/developer/user-guide/send-email-with-smtp',
    notes: 'Username is your Server Token, password is also your Server Token'
  },

  // Brevo (formerly Sendinblue)
  brevo: {
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    docs: 'https://developers.brevo.com/docs/send-a-transactional-email',
    notes: 'Use your Brevo login email and SMTP key as password'
  },

  // Mailjet
  mailjet: {
    host: 'in-v3.mailjet.com',
    port: 587,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    docs: 'https://dev.mailjet.com/smtp/setup-guide/',
    notes: 'Username is API Key, password is Secret Key'
  },

  // SparkPost
  sparkpost: {
    host: 'smtp.sparkpostmail.com',
    port: 587,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    username: 'SMTP_Injection',
    docs: 'https://developers.sparkpost.com/api/smtp/',
    notes: 'Username is always "SMTP_Injection", password is your API key'
  },

  // Mailtrap (for testing)
  mailtrap: {
    host: 'smtp.mailtrap.io',
    port: 2525,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    docs: 'https://mailtrap.io/blog/smtp-service/',
    notes: 'Development/testing only. Emails are caught, not delivered.'
  },

  // Ethereal (for testing)
  ethereal: {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    requiresAuth: true,
    authType: 'login',
    docs: 'https://ethereal.email/',
    notes: 'Testing service. Generate credentials at https://ethereal.email/'
  }
};

/**
 * Get provider configuration by name
 * @param {string} providerName - Name of the email provider
 * @returns {object} Provider configuration object
 */
export function getProvider(providerName) {
  if (typeof providerName !== 'string') {
    throw new Error(`Invalid provider name: expected string, got ${typeof providerName}`);
  }
  const provider = emailProviders[providerName.toLowerCase()];
  if (!provider) {
    throw new Error(`Unknown email provider: ${providerName}. Available providers: ${Object.keys(emailProviders).join(', ')}`);
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
export function createProviderConfig(providerOrConfig, credentials, options = {}) {
  let config;

  // Flexible API: accept a full transport config object as first argument
  if (providerOrConfig && typeof providerOrConfig === 'object' && providerOrConfig.host) {
    config = { ...providerOrConfig };
  } else {
    const providerName = providerOrConfig;
    const provider = getProvider(providerName);
    if (!credentials || !credentials.user || !credentials.pass) {
      throw new Error(`Missing credentials for ${providerName}. Required: user, pass`);
    }
    config = {
      host: provider.host,
      port: options.port || provider.port,
      secure: options.secure !== undefined ? options.secure : provider.secure,
      auth: {
        user: provider.username || credentials.user,
        pass: credentials.pass
      }
    };
  }

  // Connection options
  if (options.connectionTimeout) config.connectionTimeout = options.connectionTimeout;
  if (options.greetingTimeout) config.greetingTimeout = options.greetingTimeout;
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
      keySelector: options.dkim.keySelector || 'default',
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
  return createProviderConfig('gmail', { user: email, pass: appPassword });
}

/**
 * Create Outlook configuration
 * @param {string} email - Your Outlook/Hotmail address
 * @param {string} password - Your account password or App Password
 * @returns {object} Outlook transport configuration
 */
export function createOutlookConfig(email, password) {
  return createProviderConfig('outlook', { user: email, pass: password });
}

/**
 * Create Yahoo configuration - requires App Password
 * @param {string} email - Your Yahoo email address
 * @param {string} appPassword - Yahoo App Password
 * @returns {object} Yahoo transport configuration
 */
export function createYahooConfig(email, appPassword) {
  return createProviderConfig('yahoo', { user: email, pass: appPassword });
}

/**
 * Create SendGrid configuration
 * @param {string} apiKey - Your SendGrid API key
 * @returns {object} SendGrid transport configuration
 */
export function createSendGridConfig(apiKey) {
  return createProviderConfig('sendgrid', { user: 'apikey', pass: apiKey });
}

/**
 * Create Mailgun configuration
 * @param {string} domain - Your Mailgun domain (e.g., 'your-domain.mailgun.org')
 * @param {string} apiKey - Your Mailgun API key
 * @returns {object} Mailgun transport configuration
 */
export function createMailgunConfig(domain, apiKey) {
  return createProviderConfig('mailgun', { 
    user: `postmaster@${domain}`, 
    pass: apiKey 
  });
}

/**
 * Create testing configuration with Ethereal (safe for development)
 * @param {string} user - Ethereal username (get from https://ethereal.email)
 * @param {string} pass - Ethereal password
 * @returns {object} Ethereal transport configuration
 */
export function createTestConfig(user, pass) {
  return createProviderConfig('ethereal', { user, pass });
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
    requiresAppPassword: ['gmail', 'yahoo'].includes(providerName.toLowerCase()),
    setupSteps: getSetupSteps(providerName.toLowerCase())
  };
}

function getSetupSteps(providerName) {
  const steps = {
    gmail: [
      "1. Enable 2-Factor Authentication on your Google account",
      "2. Go to Google Account settings > Security > 2-Step Verification",
      "3. Generate an 'App Password' for 'Mail'",
      "4. Use your Gmail address and the App Password (not your regular password)"
    ],
    outlook: [
      "1. Use your Outlook.com, Hotmail.com, or Live.com email and password",
      "2. If you have 2FA enabled, you may need an App Password",
      "3. Go to Security settings > Advanced security options > App passwords"
    ],
    yahoo: [
      "1. Enable 2-Step Verification in Yahoo Account Security",
      "2. Go to Account Info > Account Security > Generate app password",
      "3. Select 'Other app' and name it (e.g., 'My App')",
      "4. Use your Yahoo email and the generated App Password"
    ],
    sendgrid: [
      "1. Sign up at SendGrid.com",
      "2. Create an API Key in Settings > API Keys",
      "3. Use 'apikey' as username and your API key as password"
    ],
    mailgun: [
      "1. Sign up at Mailgun.com and verify your domain",
      "2. Get your API key from the dashboard",
      "3. Use 'postmaster@your-domain.mailgun.org' as username"
    ]
  };
  
  return steps[providerName] || [
    "1. Check the provider's documentation for SMTP settings",
    "2. Create API credentials or App Password if required",
    "3. Use the credentials with createProviderConfig()"
  ];
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
