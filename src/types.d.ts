/**
 * TypeScript declarations for Composa
 * Email composition library with XHTML templates and Nodemailer
 */

import { Transporter } from 'nodemailer';

// ===== CORE TYPES =====

export interface EmailClientOptions {
    /** Default sender email address */
    defaultFrom?: string;
    /** Default language for templates */
    defaultLang?: string;
    /** Custom subjects for templates */
    subjects?: Record<string, Record<string, string>>;
    /** Default variables available in all templates */
    defaults?: Record<string, string>;
    /** Custom templates directory path */
    templatesPath?: string;
    /** Nodemailer transporter instance */
    transporter?: Transporter;
    /** Nodemailer transport configuration */
    transport?: any;
    /** Enable strict mode for missing variables */
    strictMode?: boolean;
}

export interface MailOptions {
    /** Recipient email address */
    to: string | string[];
    /** Email subject */
    subject: string;
    /** HTML content */
    html: string;
    /** Sender email address */
    from?: string;
    /** CC recipients */
    cc?: string | string[];
    /** BCC recipients */
    bcc?: string | string[];
    /** Reply-to address */
    replyTo?: string;
    /** Email attachments */
    attachments?: any[];
}

export interface SendResult {
    /** Whether the email was sent successfully */
    success: boolean;
    /** Message ID from the email server */
    messageId?: string;
    /** Server response */
    response?: string;
    /** Error message if failed */
    error?: string;
}

export interface BulkSendResult extends SendResult {
    /** Recipient email address */
    recipient: string;
}

export interface TemplateOptions {
    /** Language for the template */
    lang?: string;
    /** Variables to replace in the template */
    variables?: Record<string, any>;
}

export interface CompiledMail {
    /** Compiled HTML content */
    html: string;
    /** Compiled subject */
    subject: string;
}

export interface TemplateInfo {
    /** Template name */
    name: string;
    /** Template language */
    lang: string;
    /** Whether template exists */
    exists: boolean;
    /** Template source (memory, disk, none) */
    source: 'memory' | 'disk' | 'none';
    /** Whether template is cached */
    cached: boolean;
    /** File path if on disk */
    path: string | null;
}

export interface ConfigurationTest {
    /** SMTP connection status */
    smtp: boolean;
    /** DKIM configuration status */
    dkim: boolean;
    /** SMTP host */
    host?: string;
    /** SMTP port */
    port?: number;
    /** Whether connection is secure */
    secure?: boolean;
    /** Default sender */
    sender: string;
    /** Default language */
    defaultLang: string;
}

// ===== EMAIL PROVIDER TYPES =====

export interface EmailProvider {
    /** SMTP host */
    host: string;
    /** SMTP port */
    port: number;
    /** Whether to use secure connection */
    secure: boolean;
    /** Whether authentication is required */
    requiresAuth: boolean;
    /** Authentication type */
    authType: string;
    /** Documentation URL */
    docs: string;
    /** Setup notes */
    notes: string;
}

export interface ProviderCredentials {
    /** Username/email */
    user: string;
    /** Password/API key */
    pass: string;
}

export interface ProviderOptions {
    /** Custom port */
    port?: number;
    /** Custom secure setting */
    secure?: boolean;
    /** Connection timeout */
    connectionTimeout?: number;
    /** Greeting timeout */
    greetingTimeout?: number;
    /** Socket timeout */
    socketTimeout?: number;
    /** TLS configuration */
    tls?: {
        rejectUnauthorized?: boolean;
        ciphers?: string[];
    };
    /** Connection pooling */
    pool?: boolean;
    /** Max connections */
    maxConnections?: number;
    /** Max messages per connection */
    maxMessages?: number;
    /** Rate limiting */
    rateLimit?: number;
    /** DKIM configuration */
    dkim?: {
        domainName: string;
        keySelector?: string;
        privateKey: string;
    };
    /** Default from address */
    from?: string;
    /** Proxy configuration */
    proxy?: any;
    /** Logger */
    logger?: any;
    /** Debug mode */
    debug?: boolean;
}

export interface ProviderSetup {
    /** Provider name */
    provider: string;
    /** Documentation URL */
    docs: string;
    /** Setup notes */
    notes: string;
    /** Whether App Password is required */
    requiresAppPassword: boolean;
    /** Step-by-step setup instructions */
    setupSteps: string[];
}

// ===== TEMPLATE ENGINE TYPES =====

export interface TemplateEngineOptions {
    /** Default language */
    defaultLang?: string;
    /** Templates directory path */
    templatesPath?: string;
    /** Default variables */
    defaults?: Record<string, string>;
}

// ===== MAIN CLASSES =====

export declare class EmailClient {
    constructor(options?: EmailClientOptions);

    /** Default sender email */
    defaultFrom: string;
    /** Default language */
    defaultLang: string;
    /** Default variables */
    defaults: Record<string, string>;
    /** Templates path */
    templatesPath: string;
    /** Nodemailer transporter */
    transporter: Transporter;

    /** Create transport from environment variables */
    static transportFromEnv(): any;

    /** Register a subject for a template */
    registerSubject(templateName: string, lang: string, subject: string): void;

    /** Register multiple subjects for a template */
    registerSubjects(templateName: string, subjects: Record<string, string>): void;

    /** Get subject for a template */
    getSubject(templateName: string, options?: TemplateOptions): string;

    /** Send email */
    send(mailOptions: MailOptions): Promise<SendResult>;

    /** Send bulk emails */
    sendBulk(recipients: string[], mailOptions: Omit<MailOptions, 'to'>): Promise<BulkSendResult[]>;

    /** Send email with retry logic */
    sendWithRetry(mailOptions: MailOptions, maxRetries?: number): Promise<SendResult>;

    /** Send mail (alias for send) */
    sendMail(mailOptions: MailOptions): Promise<SendResult>;

    /** Compile email template and subject */
    compileMail(templateName: string, options?: TemplateOptions): CompiledMail;

    /** Verify SMTP connection */
    verifyConnection(): Promise<boolean>;

    /** Test configuration */
    testConfiguration(): Promise<ConfigurationTest>;

    /** Register template string in memory */
    registerTemplateString(templateName: string, templateString: string, lang?: string): void;

    /** Clear template cache */
    clearCache(): void;

    /** Clear specific template cache */
    clearTemplateCache(templateName: string, lang?: string): void;

    /** Compile template */
    compileTemplate(templateName: string, options?: TemplateOptions): string;

    /** Render template (deprecated) */
    render(templateName: string, variables?: Record<string, any>, lang?: string): Promise<string>;

    /** Send template (deprecated) */
    sendTemplate(options: {
        to: string;
        template: string;
        variables?: Record<string, any>;
        lang?: string;
        subject?: string;
        from?: string;
        cc?: string | string[];
        bcc?: string | string[];
        replyTo?: string;
        attachments?: any[];
    }): Promise<SendResult>;

    /** List available templates */
    listAvailableTemplates(lang?: string): string[];

    /** Check if template exists */
    templateExists(templateName: string, lang?: string): boolean;

    /** Get template information */
    getTemplateInfo(templateName: string, lang?: string): TemplateInfo;
}

export declare class TemplateEngine {
    constructor(options?: TemplateEngineOptions);

    /** Default language */
    defaultLang: string;
    /** Templates path */
    templatesPath: string;
    /** Default variables */
    defaults: Record<string, string>;

    /** Register template string in memory */
    registerTemplateString(templateName: string, templateString: string, lang?: string): void;

    /** Clear cache */
    clearCache(): void;

    /** Load template */
    load(templateName: string, lang?: string): string;

    /** Replace variables in template */
    replaceVariables(template: string, variables?: Record<string, any>): string;

    /** Render template */
    render(templateName: string, variables?: Record<string, any>, lang?: string): string;
}

// ===== PROVIDER FUNCTIONS =====

export declare const emailProviders: Record<string, EmailProvider>;

export declare function getProvider(providerName: string): EmailProvider;

export declare function createProviderConfig(
    providerOrConfig: string | any,
    credentials?: ProviderCredentials,
    options?: ProviderOptions
): any;

export declare function createGmailConfig(email: string, appPassword: string): any;

export declare function createOutlookConfig(email: string, password: string): any;

export declare function createYahooConfig(email: string, appPassword: string): any;

export declare function createTestConfig(): any;

export declare function getProviderSetup(providerName: string): ProviderSetup;

export declare function listProviders(): string[];

export declare function getProviderDocs(providerName: string): string;

export declare function getProviderNotes(providerName: string): string;

// ===== DEFAULT SUBJECTS =====

export declare const defaultSubjects: Record<string, Record<string, string>>;
