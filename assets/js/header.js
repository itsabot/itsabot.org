(function(abot) {
abot.Header = {}
abot.Header.view = function(args) {
	args = args || {}
	var los;
	if (abot.isLoggedIn()) {
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
	return m("header", [
		m(".main.header-content", [
			m(".links", [
				m("a[href=/plugins]", {
					config: m.route
				}, "Plugins"),
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
				}, m("img[src=/public/images/logo_white.svg][alt=Abot]"))
			])
		]),
		m("div", { id: "content" })
	])
}
})(!window.abot ? window.abot={} : window.abot);
