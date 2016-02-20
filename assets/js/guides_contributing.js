(function(abot) {
abot.GuidesContributing = {}
abot.GuidesContributing.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m("h1", "How to contribute"),
			m("h2", "Contributor's workflow"),
			m("p", "Unlike many open-source projects, we've "),

			m("h2", "Abot core and packages"),
			m("p", "If you build a great package that could help others, send a . This constitutes anything in the Abot repo."),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
