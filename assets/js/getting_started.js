(function(abot) {
abot.GettingStarted = {}
abot.GettingStarted.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m("h1", "Getting Started"),
			m("p", "This guide covers setting up and running Abot."),
			m("p", "You'll learn:"),
			m("ul", [
				m("li", "How to install Abot and connect your assistant to a database."),
				m("li", "How Abot thinks and processes messages."),
				m("li", "How to build a simple package for Abot."),
			]),
			m("p", [
				"But before we begin, it's pronounced ",
				m("em", "Eh-Bot"),
				", like the Canadians, not ",
				m("em", "uh-bot."),
			]),

			m("h2", "Guide assumptions"),
			m("p", [
				"This guide is designed for developers that want to build a digital assistant from scratch. It does not assume any prior experience with Abot or A.I. or machine learning. Abot is a digital assistant framework built using the ",
				m("a[href=https://golang.org/]", "Go programming language"),
				". To learn Go, please read through some of the available resources:",
			]),
			m("ul", [
				m("li", [
					m("a[href=https://tour.golang.org/basics/1]", "A Tour of Go"),
				]),
				m("li", [
					m("a[href=http://openmymind.net/assets/go/go.pdf]", "The Little Go Book"),
				]),
			]),
			m("p", [
				"If you at any time get stuck or need help with Abot, feel free to message ",
				m("a[href=mailto:abot-discussion@googlegroups.com]", "abot-discussion@googlegroups.com"),
				" and someone will help you right away.",
			]),

			m("h2", "What is Abot?"),
			m("p", "Abot is a digital assistant framework written in the Go programming language. It's designed to make it possible for anyone to build and customize digital assistants for themselves and for their businesses, whether that's a computer that answers phones and intelligently routes calls, schedules your business travel, or is just a better take on Siri that orders Ubers and does your laundry."),
			m("p", "Abot exposes a simple HTTP API, so you can easily connect it to send, process, and respond to texts, emails, and more."),

			m("h2", "Downloading, installing and running an Abot server"),
			m("p", "Ensure you've installed Go and PostgreSQL is running, then open your terminal and type:"),
			m("code", [
				m(".line", "$ git clone git@itsabot.org:repositories/abot.git"),
				m(".line", "$ cd abot"),
				m(".line", "$ createdb abot"),
				m(".line", "$ chmod +x cmd/*.sh"),
				m(".line", "$ cmd/migrateup"),
			]),
			m("p", "This will download Abot and set up your database. Then run:"),
			m("code", [
				m(".line", "$ go get ./..."),
				m(".line", "$ go install ./..."),
				m(".line", "$ abot -s"),
			]),
			m("p", "to start your server."),

			m("p", [
				"To communicate with Abot locally, talk to her using ",
				m("span.code-inline", "abotc"),
				", the Abot console. In another terminal (ensure ",
				m("span.code-inline", "abot -s"),
				" is still running), type:"
			]),
			m("code", [
				m(".line", "$ abotc localhost:4200 +13105555555"),
				m(".line", "> Hi"),
				m(".line", "Hi there!"),
			]),
			m("p", "You should see Abot's response! Go ahead and play around with some commands to get a feel for Abot's default behaviors:"),
			m("ol", [
				m("li", "Find me a nice, French wine"),
				m("li", "What's a good restaurant nearby?"),
				m("li", "My car broke down!"),
			]),
			m("p", "In the next 40 minutes, you'll learn how to customize these commands, integrate with SMS, and create your own."),

			m("h2", "Understanding how Abot works"),
			m("p", "For every message Abot receives, Abot processes, routes, and responds to the message. Actually deciding what to say is the role of packages. Let's take a look at an example:"),
			m("p", [
				m("strong", "1. User sends a message via the console, SMS, email, etc.: "), 
				m("div", "Show me Indian restaurants nearby."),
			]),
			m("p", [
				m("strong", "2. Abot pre-processes the message:"),
				m("div", [
					"Commands: ", m("span.code-inline", "[Show]"),
				]),
				m("div", [
					"Objects: ", m("span.code-inline", "[me, Indian restaurants nearby]"),
				]),
			]),
			m("p", [
				m("strong", "3. Abot routes the message to the correct package:"),
				m("div", [
					"Route: ", m("span.code-inline", "find_indian"),
				]),
				m("div", [
					"Package: ", m("span.code-inline", "ava_restaurant"),
				]),
			]),
			m("p", [
				m("strong", "4. The package generates a response:"),
				m("div", " Sure, how does Newab of India sound? It's nearby."),
			]),
			m("p", [
				m("strong", "5. Abot sends the response to the user."),
				m("div", "Abot sends the response through the same channel the user chose, so if the user sends Abot a text, Abot will respond in text automatically."),
			]),
			m("p", "Thus, every message goes from User -> Abot -> Package -> Abot -> User."),

			m(".card-right", [
				m("p.card", [
					m("strong", "What are packages? "),
					"Packages are tiny executable servers written in Go. When Abot boots, it starts every package listed in your ",
					m("span.code-inline", "packages.json"),
					" file. Abot provides all the tools you need to quickly and easily write these packages through its shared library, which we'll learn about in a bit.",
				]),
			]),

			m("h2", "Your first package"),
			m("p", "Let's build a \"Hello World\" package, which will introduce you to the package API. First, let's create our package directory:"),
			m("code", [
				m(".line", "$ mkdir packages/abot_hello"),
				m(".line", "$ touch packages/abot_hello/abot_hello.go"),
			]),
			m("p", [
				"Now let's take a look at the contents of a simple package. You should include the below code snippets into , or you can download a working version ",
				// TODO
				m("a[href=/guides/getting_started/abot_hello.go]", "here."),
			]),

			m("h2", "Deploying your Abot"),
			m("p", "For this guide we'll deploy to Heroku to keep things simple, but Go and Abot makes it easy to deploy on any web server."),

			m("h2", "Next steps"),
			m("p", "As next steps, try:"),
			m("ul", [
				m("li", m("a[href=#/]", "Creating an Account")),
				m("li", m("a[href=#/]", "Speaking to Abot")),
				m("li", [
					"Reading the ",
					m("a[href=#/]", "Getting Started guide.")
				]),
				m("li", m("a[href=#/]", "Building a package")),
				m("li", [
					"Learning ",
					m("a[href=#/]", "How to Contribute.")
				]),
				m("li", "Deploying to Heroku (coming soon)")
			])
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
