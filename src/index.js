export { default as EmailClient } from "./email-client.js";
export { default as defaultSubjects } from "./default-subjects.js";
export { 
  emailProviders,
  getProvider,
  createProviderConfig,
  listProviders,
  getProviderDocs,
  getProviderNotes,
  createGmailConfig,
  createOutlookConfig,
  createYahooConfig,
  createSendGridConfig,
  createMailgunConfig,
  createTestConfig,
  getProviderSetup
} from "./email-providers.js";
