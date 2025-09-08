import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class EmailClient {
    constructor(options = {}) {
        this.defaultFrom = options.defaultFrom || process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@example.com";
        this.defaultLang = options.defaultLang || "en";

        this.subjects = new Map();
        if (options.subjects && typeof options.subjects === "object") {
            for (const [template, perLang] of Object.entries(options.subjects)) {
                this.subjects.set(template, { ...perLang });
            }
        }

        this.defaults = {
            APP_NAME: options.defaults?.APP_NAME || "Your App",
            APP_URL: options.defaults?.APP_URL || "https://example.com",
            SUPPORT_EMAIL: options.defaults?.SUPPORT_EMAIL || "support@example.com",
            CURRENT_YEAR: String(new Date().getFullYear()),
            ...options.defaults,
        };

        this.templatesPath = options.templatesPath || path.join(__dirname, "..", "templates");
        this.cache = new Map();
        this.memoryTemplates = new Map();

        this.transporter = options.transporter 
            || nodemailer.createTransport(options.transport || EmailClient.transportFromEnv());
    }

    static transportFromEnv() {
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            throw new Error("Incomplete SMTP configuration. Required: SMTP_HOST, SMTP_USER, SMTP_PASSWORD");
        }
        const config = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587", 10),
            secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
            pool: true,
            maxConnections: 5,
            maxMessages: 10,
            rateLimit: 10,
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000,
        };
        if (process.env.DKIM_PRIVATE_KEY && process.env.DKIM_DOMAIN) {
            config.dkim = {
                domainName: process.env.DKIM_DOMAIN,
                keySelector: process.env.DKIM_SELECTOR || "default",
                privateKey: process.env.DKIM_PRIVATE_KEY,
            };
        }
        return config;
    }

    registerSubject(templateName, lang, subject) {
        if (!this.subjects.has(templateName)) this.subjects.set(templateName, {});
        this.subjects.get(templateName)[lang] = subject;
    }

    registerSubjects(templateName, map) {
        if (!this.subjects.has(templateName)) this.subjects.set(templateName, {});
        Object.assign(this.subjects.get(templateName), map);
    }

    getSubject(templateName, { lang = this.defaultLang, variables = {} } = {}) {
        const perLang = this.subjects.get(templateName) || {};
        const subject = perLang[lang] || perLang[this.defaultLang] || this.#humanize(templateName);
        return this.#replaceVariables(subject, variables);
    }

    #humanize(id) {
        return String(id)
            .replace(/[-_]+/g, " ")
            .trim()
            .replace(/(^|\s)\S/g, s => s.toUpperCase());
    }

    async send(mailOptions) {
        const options = { from: this.defaultFrom, ...mailOptions };
        const info = await this.transporter.sendMail(options);
        return { success: true, messageId: info.messageId, response: info.response };
    }

    async sendBulk(recipients, mailOptions) {
        const results = [];
        for (const recipient of recipients) {
            try {
                const res = await this.send({ ...mailOptions, to: recipient });
                results.push({ recipient, ...res });
            } catch (error) {
                results.push({ recipient, success: false, error: error.message });
            }
        }
        return results;
    }

    async sendWithRetry(mailOptions, maxRetries = 3) {
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const res = await this.send(mailOptions);
                if (res.success) return res;
                lastError = new Error(res.error || "Unknown error");
            } catch (err) {
                lastError = err;
            }
            if (attempt < maxRetries) await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
        return { success: false, error: `Failure after ${maxRetries} attempts: ${lastError?.message || lastError}` };
    }

    async sendMail({ to, subject, html, from, cc, bcc, replyTo, attachments }) {
        return this.send({ to, subject, html, from, cc, bcc, replyTo, attachments });
    }

    compileMail(templateName, { lang = this.defaultLang, variables = {} } = {}) {
        const html = this.compileTemplate(templateName, { lang, variables });
        const subject = this.getSubject(templateName, { lang, variables });
        return { html, subject };
    }

    async verifyConnection() {
        try { await this.transporter.verify(); return true; } 
        catch { return false; }
    }

    async testConfiguration() {
        const smtp = await this.verifyConnection();
        const hasDkim = !!this.transporter.options?.dkim;
        return {
            smtp,
            dkim: hasDkim,
            host: this.transporter.options?.host,
            port: this.transporter.options?.port,
            secure: this.transporter.options?.secure,
            sender: this.defaultFrom,
            defaultLang: this.defaultLang,
        };
    }

    // --- Template Engine ---
    registerTemplateString(templateName, templateString, lang = this.defaultLang) {
        this.memoryTemplates.set(`${lang}/${templateName}`, templateString);
    }

    clearCache() { this.cache.clear(); }

    #readTemplateFromDiskSync(templateName, lang) {
        const filePath = path.join(this.templatesPath, lang, `${templateName}.xhtml`);
        if (!fs.existsSync(filePath)) throw new Error(`Template file missing: ${filePath}`);
        return fs.readFileSync(filePath, "utf8");
    }

    #loadTemplate(templateName, lang = this.defaultLang) {
        const key = `${lang}/${templateName}`;
        if (this.memoryTemplates.has(key)) return this.memoryTemplates.get(key);
        if (this.cache.has(key)) return this.cache.get(key);
        try {
            const tpl = this.#readTemplateFromDiskSync(templateName, lang);
            this.cache.set(key, tpl);
            return tpl;
        } catch (err) {
            throw new Error(`Template "${templateName}" not found for language "${lang}"`);
        }
    }

    #replaceVariables(template, variables = {}) {
        const data = { ...this.defaults, ...variables };
        const missing = [];
        const result = template.replace(/{{(.*?)}}/g, (_, key) => {
            if (data[key] == null) {
                missing.push(key);
                return "";
            }
            return data[key];
        });
        if (missing.length) console.warn(`Warning: missing variables in template: ${missing.join(", ")}`);
        return result;
    }

    compileTemplate(templateName, { lang = this.defaultLang, variables = {} } = {}) {
        const tpl = this.#loadTemplate(templateName, lang);
        return this.#replaceVariables(tpl, variables);
    }
}
