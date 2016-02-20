(function(abot) {
abot.Header = {}
abot.Header.view = function() {
	return m("header", [
		m("div", [
			m(".links", [
				m("a", {
					href: "/guides",
					config: m.route
				}, "Guides"),
				m("a", {
					href: "/",
					config: m.route
				}, "API"),
				// TODO
				/*
				m("a", {
					href: "/",
					config: m.route
				}, "Packages"),
				*/
				m("a", {
					href: "/",
					config: m.route
				}, "Ask for help"),
				m("a", {
					href: "/",
					config: m.route
				}, "Contribute"),
			]),
			m(".logo", [
				m("a", {
					href: "/",
					config: m.route
				}, "Abot")
			])
		]),
		m("div", { id: "content" })
	])
}
})(!window.abot ? window.abot={} : window.abot);
