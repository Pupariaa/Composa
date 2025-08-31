import TemplateEngine from "./template-engine.js";

/**
 * Universal email client with:
 * - Nodemailer transport
 * - File-based multilingual templates (XHTML)
 * - Subjects registry with interpolation
 * - send / sendBulk / sendWithRetry helpers
 */
let _nodemailer = null;
try {
  const mod = await import('nodemailer');
  _nodemailer = mod.default || mod;
} catch (_) {
  // Optional during tests if a custom transporter is injected
  _nodemailer = null;
}

export default class EmailClient {
  constructor(options = {}) {
    // Transporter
    if (options.transporter) {
      this.transporter = options.transporter;
    } else if (options.transport) {
      if (!_nodemailer) throw new Error('nodemailer is required: please add the dependency or provide a custom transporter');
      this.transporter = _nodemailer.createTransport(options.transport);
    } else {
      if (!_nodemailer) throw new Error('nodemailer is required: please add the dependency or provide a custom transporter');
      this.transporter = _nodemailer.createTransport(EmailClient.transportFromEnv());
    }

    // Defaults
    this.defaultFrom = options.defaultFrom || process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@example.com";
    this.defaultLang = options.defaultLang || "en";

    // Template engine
    this.templates = new TemplateEngine({
      defaultLang: this.defaultLang,
      templatesPath: options.templatesPath,
      defaults: options.defaults,
    });

    // Subjects registry: { templateName: { lang: subject } }
    this.subjects = new Map();
    if (options.subjects && typeof options.subjects === "object") {
      for (const [template, perLang] of Object.entries(options.subjects)) {
        this.subjects.set(template, { ...perLang });
      }
    }
  }

  // --- Transport helpers ---
  static transportFromEnv() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error(
        "Incomplete SMTP configuration. Required: SMTP_HOST, SMTP_USER, SMTP_PASSWORD"
      );
    }

    const config = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Optional pooling for throughput; safe defaults
      pool: true,
      maxConnections: 5,
      maxMessages: 10,
      rateLimit: 10,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    };

    // Optional DKIM from env (generic, not brand-specific)
    if (process.env.DKIM_PRIVATE_KEY && process.env.DKIM_DOMAIN) {
      config.dkim = {
        domainName: process.env.DKIM_DOMAIN,
        keySelector: process.env.DKIM_SELECTOR || "default",
        privateKey: process.env.DKIM_PRIVATE_KEY,
      };
    }
    return config;
  }

  // --- Subjects ---
  registerSubject(templateName, lang, subject) {
    if (!this.subjects.has(templateName)) this.subjects.set(templateName, {});
    this.subjects.get(templateName)[lang] = subject;
  }

  registerSubjects(templateName, map) {
    if (!this.subjects.has(templateName)) this.subjects.set(templateName, {});
    Object.assign(this.subjects.get(templateName), map);
  }

  getSubject(templateName, lang = this.defaultLang, variables = {}) {
    const perLang = this.subjects.get(templateName) || {};
    const subject = perLang[lang] || perLang[this.defaultLang] || this.#humanize(templateName);
    return this.templates.replaceVariables(subject, variables);
  }

  // Very small helper to humanize a template id like "new-device-connected" => "New device connected"
  #humanize(id) {
    return String(id)
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/(^|\s)\S/g, (s) => s.toUpperCase());
  }

  // --- Sending helpers ---
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
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    return { success: false, error: `Failure after ${maxRetries} attempts: ${lastError?.message || lastError}` };
  }

  // --- Templates: render + send ---
  async render(templateName, variables = {}, lang = this.defaultLang) {
    return this.templates.render(templateName, variables, lang);
  }

  /**
   * Send a template by id and language.
   * opts = { to, template, variables?, lang?, subject?, from?, cc?, bcc?, replyTo?, attachments? }
   */
  async sendTemplate(opts) {
    const {
      to,
      template,
      variables = {},
      lang = this.defaultLang,
      subject = this.getSubject(template, lang, variables),
      from,
      cc,
      bcc,
      replyTo,
      attachments,
    } = opts;

    const html = await this.render(template, variables, lang);
    return this.send({ to, subject, html, from, cc, bcc, replyTo, attachments });
  }

  // --- Diagnostics ---
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (err) {
      return false;
    }
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
}
