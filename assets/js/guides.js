(function(abot) {
abot.Guides = {}
abot.Guides.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m("h1", "Guides"),
			m("ol", [
				m("li", [
					m("a[href=guides/getting_started]", {
						config: m.route,
					}, "Getting Started"),
				]),
			])
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
