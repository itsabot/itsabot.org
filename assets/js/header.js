(function(abot) {
abot.Header = {}
abot.Header.view = function(args) {
	args = args || {}
	return m("header", [
		m(".header-content", [
			m(".links", [
				m("a[href=/guides]", {
					config: m.route
				}, "Guides"),
				m("a[href=/plugins]", {
					config: m.route
				}, "Plugins"),
				m("a[href=https://godoc.org/github.com/itsabot/abot]", {
					class: "hidden-small",
				}, "API"),
				m("a.hidden-small", {
					href: "https://groups.google.com/forum/#!forum/abot-discussion",
				}, "Ask for help"),
				m("a.hidden-small", {
					href: "https://github.com/itsabot/abot/wiki/How-to-Contribute",
				}, "Contribute"),
			]),
			m(".logo", [
				m("a[href=/]", {
					config: m.route,
				}, "Abot")
			])
		]),
		m("div", { id: "content" })
	])
}
})(!window.abot ? window.abot={} : window.abot);
