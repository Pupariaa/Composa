import { EmailClient, defaultSubjects } from "composa";

const mockMailer = new EmailClient({
	defaultLang: "en",
	subjects: defaultSubjects,
	defaults: { APP_NAME: "TestApp" },
	transporter: {
		sendMail: async (mailOptions) => ({
			messageId: `mock-${Date.now()}`,
			response: "Mock OK",
		}),
		verify: async () => true,
	},
});

function run() {
	// Each item is a separate template
	const items = [
		{ name: "Item 1", price: "$10", link: "https://example.com/item1" },
		{ name: "Item 2", price: "$20", link: "https://example.com/item2" },
		{ name: "Item 3", price: "$30", link: "https://example.com/item3" },
	];

	// Compile each item using a mini-template 'list-item.xhtml'
	const compiledItems = items.map((item) =>
		mockMailer.compileTemplate("list-item", {
			variables: { NAME: item.name, PRICE: item.price, LINK: item.link },
		}),
	);

	// Inject the compiled items into the main template
	const { html, subject } = mockMailer.compileMail("complex-template", {
		variables: {
			USER_NAME: "John Doe",
			ITEM_LIST: `<ul>${compiledItems.join("")}</ul>`,
		},
	});

	mockMailer
		.sendMail({
			to: "john@example.com",
			html,
			subject,
		})
		.then((result) => {
			console.log("Sent complex HTML email with compiled list:", result);
		})
		.catch((err) => {
			console.error("Failed to send email:", err);
		});
}

run();
