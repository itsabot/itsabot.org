(function(abot) {
abot.AskForHelp = {}
abot.AskForHelp.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m("h1", "Ask for help"),
			m("ul", [
				m("li", [
					m("a[href=https://groups.google.com/forum/#!forum/abot-discussion]", "Join our discussion mailing group:"),
					" You'll speak directly to core contributors who can help you with any problems you have."
				]),
				m("li", [
					m("a[href=https://bugzilla.itsabot.org/]", "Report a bug:"),
					" We'll get back to you quickly with a timeline and let you know when a fix will be available."
				]),
				m("li", [
					m("a[href=mailto:admin@itsabot.org]", "Report a security vulnerability:"),
					" If you discover a security vulnerability, please do not email the discussion group or post on Bugzilla. Instead, please email the founder directly through ",
					m("a[href=mailto:admin@itsabot.org]", "admin@itsabot.org"),
					".",
				]),
			]),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
