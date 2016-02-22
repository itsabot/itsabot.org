(function(abot) {
abot.Index = {}
abot.Index.view = function() {
	return m("div", [
		m(".hero-container", [
			m.component(abot.Header),
			m(".main", [
				m(".hero", [
					m("h1", "Build your own digital assistant"),
					m("p", "Digital assistants are huge, complex pieces of software. Abot makes it easy and fun to build your own digital assistant, and we include everything you need to get started."),
					m(".btn-container", [
						m("a[href=https://github.com/itsabot/abot].btn", "Download the latest version"),
						m("div", m(".subtle", "Pre-alpha, version 0.0.1")),
					]),
					m("img[src=/public/images/abot_2.png].left"),
					m("img[src=/public/images/abot_1.png].center"),
					m("img[src=/public/images/abot_3.png].right"),
				]),
			]),
		]),
		m(".main", [
			m(".content", [
				m("p", [
					m("strong", "Abot is open source software. "),
					"That means it's free to use, and you can re-program it to do anything you can imagine.",
				]),
				m("p", [
					m("strong", "We make it easy to build the assistant. "),
					"Abot comes pre-installed with tools to manage and understand human language and guides to help you.",
				]),
				m("p", [
					m("strong", "Make it available everywhere. "),
					"Ava exposes an HTTP API, so you can easily integrate into email, SMS, Twitter, Slack, or however else you want to communicate.",
				]),
			]),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
