(function(abot) {
abot.Guides = {}
abot.Guides.view = function() {
	return m("div", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				m("h1", "Guides"),
				m("p", [
					"Here we'll add guides as they're written. We're also looking for someone to join the core contributor team focused on improving devops and documentation. That contributor will focus on making Abot development as delightfue as possible by ensuring we have excellent documentation, easy installation tools, thorough guides, and more."
				]),
				m("p", [
					"Interested in contributing a guide? Visit the ",
					m("a", {
						href: "https://github.com/itsabot/abot/wiki/How-to-Contribute",
					}, "How to Contribute"),
					" guide to learn more.",
				]),
				m("ol", [
					m("li", [
						m("a", {
							href: "https://github.com/itsabot/abot/wiki/Getting-Started",
						}, "Getting Started"),
					]),
					m("li", [
						m("a", {
							href: "https://github.com/itsabot/abot/wiki/Building-a-Plugin",
						}, "Building a Plugin"),
					]),
					m("li", [
						m("a", {
							href: "https://github.com/itsabot/abot/wiki/Adding-SMS-Messaging-to-Abot",
						}, "Adding SMS Messaging"),
					]),
					m("li", [
						m("a", {
							href: "https://github.com/itsabot/abot/wiki/Using-the-Plugin-Manager",
						}, "Using the Plugin Manager"),
					]),
					m("li", [
						m("a", {
							href: "https://github.com/itsabot/abot/wiki/Getting-Started#deploying-your-abot",
						}, "Deploying to Heroku"),
					]),
					m("li", [
						m("a", {
							href: "https://github.com/itsabot/abot/wiki/How-to-Contribute",
						}, "How to Contribute"),
					]),
				])
			])
		]),
		m.component(abot.Footer),
	])
}
})(!window.abot ? window.abot={} : window.abot);
