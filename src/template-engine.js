import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Lightweight template engine to load XHTML templates by language
 * and replace {{PLACEHOLDER}} variables.
 *
 * This is a retro-compatibility wrapper around the integrated template engine
 * in EmailClient. For new code, use EmailClient methods directly.
 */
export default class TemplateEngine {
	constructor(options = {}) {
		const defaultTemplatesPath = path.join(__dirname, "..", "templates");

		this.defaultLang = options.defaultLang || "en";
		this.templatesPath = options.templatesPath || defaultTemplatesPath;

		// Defaults available to every template (e.g., APP_NAME, APP_URL, ...)
		this.defaults = {
			APP_NAME: options.defaults?.APP_NAME || "Your App",
			APP_URL: options.defaults?.APP_URL || "https://example.com",
			SUPPORT_EMAIL:
				options.defaults?.SUPPORT_EMAIL || "support@example.com",
			STATUS_URL:
				options.defaults?.STATUS_URL || "https://status.example.com",
			TERMS_URL:
				options.defaults?.TERMS_URL || "https://example.com/terms",
			COMMUNITY_GUIDELINES_URL:
				options.defaults?.COMMUNITY_GUIDELINES_URL ||
				"https://example.com/community-guidelines",
			LEGAL_EMAIL: options.defaults?.LEGAL_EMAIL || "legal@example.com",
			APPEALS_EMAIL:
				options.defaults?.APPEALS_EMAIL ||
				options.defaults?.SUPPORT_EMAIL ||
				"support@example.com",
			LOGO_URL:
				options.defaults?.LOGO_URL ||
				"https://cdn.example.com/logo.png",
			CURRENT_YEAR: String(new Date().getFullYear()),
			...options.defaults,
		};

		this.cache = new Map(); // key: `${lang}/${templateName}` -> template string
		this.memoryTemplates = new Map(); // key: `${lang}/${templateName}` -> template string
	}

	/**
	 * Register a template string in memory (no filesystem access).
	 * Useful to add/override models at runtime.
	 */
	registerTemplateString(
		templateName,
		templateString,
		lang = this.defaultLang,
	) {
		const key = `${lang}/${templateName}`;
		this.memoryTemplates.set(key, templateString);
	}

	clearCache() {
		this.cache.clear();
	}

	/**
	 * Try to read a template from disk for a given lang.
	 */
	#readTemplateFromDiskSync(templateName, lang) {
		// Validate template name to prevent path traversal
		if (
			!templateName ||
			typeof templateName !== "string" ||
			templateName.includes("..") ||
			templateName.includes("/")
		) {
			throw new Error(
				`Invalid template name: "${templateName}". Template names must be safe strings without path traversal.`,
			);
		}

		const filePath = path.join(
			this.templatesPath,
			lang,
			`${templateName}.xhtml`,
		);
		if (!fs.existsSync(filePath)) {
			throw new Error(`Template file missing: ${filePath}`);
		}
		return fs.readFileSync(filePath, "utf8");
	}

	/**
	 * Map short language codes to folder names if needed (e.g., en -> en-EN).
	 */
	#getLangCandidates(lang) {
		const normalized = (lang || this.defaultLang).toLowerCase();
		const list = [normalized];
		// Add common variants as fallbacks
		if (normalized === "en") list.push("en-EN", "en-US");
		if (normalized === "fr") list.push("fr-FR");
		return list;
	}

	/**
	 * Load a template by name and language with caching and fallbacks.
	 */
	load(templateName, lang = this.defaultLang) {
		const candidates = this.#getLangCandidates(lang);
		for (const candidate of candidates) {
			const key = `${candidate}/${templateName}`;

			if (this.memoryTemplates.has(key))
				return this.memoryTemplates.get(key);
			if (this.cache.has(key)) return this.cache.get(key);

			try {
				const tpl = this.#readTemplateFromDiskSync(
					templateName,
					candidate,
				);
				this.cache.set(key, tpl);
				return tpl;
			} catch (err) {
				// try next candidate
			}
		}

		// Final attempt: try defaultLang candidates
		const fallbacks = this.#getLangCandidates(this.defaultLang);
		for (const candidate of fallbacks) {
			const key = `${candidate}/${templateName}`;
			if (this.memoryTemplates.has(key))
				return this.memoryTemplates.get(key);
			if (this.cache.has(key)) return this.cache.get(key);
			try {
				const tpl = this.#readTemplateFromDiskSync(
					templateName,
					candidate,
				);
				this.cache.set(key, tpl);
				return tpl;
			} catch (err) {}
		}

		throw new Error(`Template not found: ${templateName} (lang=${lang})`);
	}

	/**
	 * Replace {{VARIABLE}} placeholders in a template using provided variables
	 * merged with engine defaults.
	 */
	replaceVariables(template, variables = {}) {
		const data = { ...this.defaults, ...variables };
		const missing = [];
		const used = new Set();

		// More efficient regex with word boundaries and better escaping
		const result = template.replace(
			/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g,
			(match, key) => {
				used.add(key);
				if (data[key] == null) {
					missing.push(key);
					return "";
				}
				// Escape HTML in variables to prevent XSS
				return String(data[key]).replace(/[&<>"']/g, (char) => {
					const escapeMap = {
						"&": "&amp;",
						"<": "&lt;",
						">": "&gt;",
						'"': "&quot;",
						"'": "&#39;",
					};
					return escapeMap[char];
				});
			},
		);

		if (missing.length) {
			console.warn(
				`Warning: missing variables in template: ${missing.join(", ")}`,
			);
		}

		return result;
	}

	/**
	 * Render a template (load + replace variables).
	 */
	render(templateName, variables = {}, lang = this.defaultLang) {
		const tpl = this.load(templateName, lang);
		return this.replaceVariables(tpl, variables);
	}
}
