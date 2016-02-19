(function(abot) {
abot.Index = {}
abot.Index.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m(".centered", [
				m("img[src=public/img/logo-no-text.svg]"),
				m("h1", "Build your own digital assistant"),
				m("p", "Digital assistants are huge, complex pieces of software. Abot makes it easy and fun to build your own digital assistant, and we include everything you need to get started."),
				m(".btn-container", [
					m("a[href=getting_started].btn", "Download the latest version"),
				])
			]),
			m("p", [
				m("strong", "Abot is open source software. "),
				"That means it's free to use, and you can re-program it.",
			]),
			m("p", [
				m("strong", "We make it easy to build the assistant. "),
				"Abot comes pre-installed with tools to manage and understand human language and guides to help you.",
			]),
			m("p", [
				m("strong", "Make it available everywhere. "),
				"Ava exposes an HTTP API, so you can easily integrate into email, SMS, Twitter, Slack, or however else you want to communicate.",
			]),
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
