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
						m("div", m(".subtle", "Version 0.1.0")),
					]),
					m("img[src=/public/images/abot_set.png]"),
				]),
			]),
		]),
		m(".main", [
			m(".content", [
				m(".focusbox", [
					m(".focusbox-center", [
						m("h2", "Automate critical tasks"),
						m("p", "Whether you're automating customer service; inbound sales; or just want your own, personal Jarvis, let Abot do the heavy lifting."),
					]),
				]),
			]),
			m(".content", [
				m(".focusbox", [
					m(".focusbox-third", [
						m("p", [
							m("h3", "Abot is open-source"),
							"That means it's free to use, and you can re-program it to do anything you can imagine. ",
							m("a[href=/plugins]", {
								config: m.route,
							}, "Search for pre-built plugins"),
							" or create your own.",
						]),
					]),
					m(".focusbox-third", [
						m("p", [
							m("h3", "Easy to build"),
							"We make it easy to build the assistant. Abot comes pre-installed with tools to manage and understand human language and guides to help.",
						]),
					]),
					m(".focusbox-third", [
						m("p", [
							m("h3", "Available everywhere"),
							"Ava exposes an HTTP API, so you can easily integrate into email, SMS, Twitter, Slack, or however else you want to communicate.",
						]),
					]),
				]),
			]),
		]),
		m.component(abot.Footer),
	])
}
})(!window.abot ? window.abot={} : window.abot);
