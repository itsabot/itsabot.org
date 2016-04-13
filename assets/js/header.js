(function(abot) {
abot.Header = {}
abot.Header.view = function(args) {
	args = args || {}
	var los;
	abot.Login.checkAuth(function(loggedIn) {
		if (loggedIn) {
			los = [
				m("a[href=/profile]", { config: m.route }, "Profile"),
				m("a[href=#/]", { onclick: abot.signout }, "Sign out"),
			]
		} else {
			los = [
				m("a[href=/login]", { config: m.route }, "Log in"),
				m("a[href=/signup]", { config: m.route }, "Sign up"),
			]
		}
	})
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
				los,
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
