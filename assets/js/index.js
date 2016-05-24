(function(abot) {
abot.Index = {}
abot.Index.view = function() {
	return m("div", [
		m(".hero-container", [
			m.component(abot.Header),
			m(".main", [
				m(".hero", [
					m(".hero-content", [
						m("h1", "Build your own digital assistant"),
						m("p", "Digital assistants are huge, complex pieces of software. Abot makes it easy and fun to build your own digital assistant, and we include everything you need to get started."),
						m(".btn-container", [
							m("a[href=https://github.com/itsabot/abot].btn", "Download the latest version"),
							m("div", m(".subtle", "Version 0.2.0")),
						]),
					]),
					m(".hero-image", [
						m("img[src=/public/images/iphone_wireframe.svg][alt=iPhone]"),
						m("video[src=/public/images/rec2_720.mp4]", {
							autoplay: true,
							loop: false,
							muted: true,
							controls: false,
						}),
					]),
				]),
			]),
		]),
		m(".main", [
			m(".content", [
				m(".focusbox.focusbox-margin.centered", [
					m("img.icon[src=/public/images/technology.svg][alt=Atom]"),
					m("h2", "Automate critical tasks"),
					m("p", "Whether you're automating customer service; inbound sales; or just want your own, personal Jarvis, let Abot do the heavy lifting. Install plugins to handle common tasks and customize the rest."),
				]),
			]),
			m(".content", [
				m(".focusbox.centered", [
					m(".focusbox-third", [
						m("p", [
							m("img.icon-sm[src=/public/images/layers.svg][alt=Layers]"),
							m("h3", "Open source"),
							"Abot is free to use, and you can re-program it to do anything you can imagine. ",
							m("a[href=/plugins]", {
								config: m.route,
							}, "Search for pre-built plugins"),
							" or create your own.",
						]),
					]),
					m(".focusbox-third", [
						m("p", [
							m("img.icon-sm[src=/public/images/wrench.svg][alt=Wrench]"),
							m("h3", "Easy to build"),
							"We make it easy to build the assistant. Abot comes pre-installed with tools to manage and understand human language and guides to help.",
						]),
					]),
					m(".focusbox-third", [
						m("p", [
							m("img.icon-sm[src=/public/images/kiwi.svg][alt=Kiwi]"),
							m("h3", "Available everywhere"),
							"Abot exposes an HTTP API, so you can easily integrate into email, SMS, Twitter, Slack, or however else you want to communicate.",
						]),
					]),
				]),
			]),
			m(".content", [
				m(".focusbox.focusbox-margin", [
					m(".focusbox-left", [
						m("h2", "Leverage an advanced language framework"),
						m("p", "Easily build plugins using Abot's own NLP tools. Abot recognizes Commands and Objects out of the box. With training, Abot will even recognize the intention behind sentences."),
						m(".cta", [
						  m("a.btn-light[href=https://github.com/itsabot/abot/wiki/Building-a-Plugin]", "Learn about plugins")
						]),
					]),
					m(".focusbox-right", [
						m("img.img[src=/public/images/api.jpg][alt=Terminal]"),
					]),
				]),
			]),
			m(".content", [
				m(".focusbox.focusbox-margin", [
					m(".focusbox-left", [
						m("img.img[src=/public/images/dashboard.jpg][alt=Macbook]"),
					]),
					m(".focusbox-right", [
						m("h2", "Manage your Abot effortlessly"),
						m("p", "Abot comes pre-loaded with a powerful admin dashboard including analytics, tools to train your Abot, and a response panel to communicate directly with customers when they ask questions Abot can't answer."),
						m("p", "It's everything you need to get started."),
					]),
				]),
			]),
			m(".content", [
				m(".focusbox.focusbox-margin.centered", [
					m(".group", [
						m("img.icon[src=/public/images/logo_heroku.svg][alt=Heroku]"),
						m("img.icon[src=/public/images/logo_docker.jpg][alt=Docker]"),
						m("img.icon[src=/public/images/logo_google_cloud.svg][alt=Google Cloud]"),
					]),
					m("h2", "Achieve huge scale"),
					m("p", "Abot's built from the ground up to be fast, lightweight, and hugely scalable. Abot processes messages in under 5ms and runs on machines with 512MB RAM, enabling you to launch low-cost clustered deployments without breaking the bank."),
					m("p", "Best of all, it works with all the tools you already know and love, like Heroku, Docker, and the Google Cloud, or you can deploy it on any Linux or Windows server."),
					m(".cta", [
						m("a.btn-light[href=https://github.com/itsabot/abot/wiki/Getting-Started#deploying-your-abot]", "Learn how to deploy Abot on Heroku")
					]),
					m(".content", [
					]),
				]),
			]),
			m(".content", [
				m(".focusbox.centered.focusbox-no-border", [
					m("h2", "Take Abot for a spin"),
					m("p", "Install Abot, add plugins, and deploy to Heroku in less than an hour."),
					m("a[href=https://github.com/itsabot/abot].btn", "Get Started"),
				]),
			]),
		]),
		m.component(abot.Footer),
	])
}
})(!window.abot ? window.abot={} : window.abot);
