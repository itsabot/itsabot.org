(function(abot) {
abot.Guides = {}
abot.Guides.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m("h1", "Guides"),
			m("p", [
				"Here we'll add guides as they're written. We're also looking for someone to join the core contributor team focused on improving devops and documentation. That contributor will focus on making Abot development as delightfue as possible by ensuring we have excellent documentation, easy installation tools, thorough guides, and more."
			]),
			m("p", [
				"Interested in contributing a guide? Visit the ",
				m("a[href=/guides/contribute]", "How to Contribute"),
				" guide to learn more.",
			]),
			m("ol", [
				m("li", [
					m("a[href=guides/getting_started]", {
						config: m.route,
					}, "Getting Started"),
				]),
				m("li", [
					m("a[href=guides/contributing]", {
						config: m.route,
					}, "Contributing"),
				]),
			])
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
