(function(abot) {
abot.GuidesAdvancedPackages = {}
abot.GuidesAdvancedPackages.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m("h1", "Advanced Packages"),
			m("p", "This guide teaches advanced package development features."),
			m("p", "You'll learn:"),
			m("ul", [
				m("li", "How to set up and use a state machine."),
				m("li", "How to respond to keywords alongside a state machine."),
				m("li", "How to integrate an external service."),
				m("li", "How to handle branching conversations."),
			]),

			m("h2", "Setting up a state machine"),
			m("p", [
				"A state machine is the core of any package, so first let's ",
			]),
			m("p", "Generally, a state machine is a great tool to manage a user's progression in a converstation from some start to some end, such as "),
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
				m(".line", "$ git clone git@www.itsabot.org:abot.git"),
				m(".line", "$ cd abot"),
				m(".line", "$ createdb abot"),
				m(".line", "$ chmod +x cmd/*.sh"),
				m(".line", "$ cmd/migrateup.sh"),
			]),
			m("p", "This will download Abot and set up your database. Then run:"),
			m("code", [
				m(".line", "$ go install ./..."),
				m(".line", "$ abot -s"),
			]),
			m("p", [
				"to start your server. The ",
				m("span.code-inline", "-s"),
				" flag stands for \"server\", and it will run by default on port 4200, though that can be set through the PORT environment variable.",
			]),
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
			]),
			m("p", [
				"Now let's take a look at the contents of a simple package. You should download and copy this working version and save it to packages/abot_hello/",
				// TODO
				m("a[href=http://pastebin.com/raw/zPY2sTuT]", "abot_hello.go"),
				". Be sure to read through the comments in the file, as the comments will explain the API as its introduced and used.",
			]),
			m("h3", "Package Setup"),
			m("p", [
				"At this point, you've downloaded the complete Hello World package from above (",
				m("a[href=http://pastebin.com/raw/zPY2sTuT]", "abot_hello.go"),
				") and saved it to packages/abot_hello/abot_hello.go. Let's ensure that Abot knows about the new package by adding it to the packages.json file.",
			]),
			m("pre", [
				m("code", [
					'{\n',
					'	"name": "abot",\n',
					'	"version": "0.0.1",\n',
					'	"dependencies": {\n',
					'		"abot_hello": "*"\n',
					'	}\n',
					'}',
				]),
			]),
			m("p", "Now we'll recompile and install Abot and run it. From your terminal, type:"),
			m("code", [
				"$ go install ./... && abot -s",
			]),
			m("p", "You should see Abot boot with a line or two mentioning our new package, abot_hello. Let's test it out. Open another terminal while abot -s is still running, and type:"),
			m("code", [
				m(".line", "$ abotc localhost:4200 +13105555555"),
				m(".line", "> Say something"),
				m(".line", "Hello World!"),
			]),
			m("p", "Abot just routed your message to the package based on the trigger defined in our abot_hello.go. The state machine told it to respond with \"Hello World!\" when it entered its first state, and since there were no other states, that state is replayed every time a new message matching abot_hello.go's trigger is sent to Abot. Now let's try to connect Abot to SMS, so it responds to our text messages."),
			
			m("h2", "Configuring SMS"),
			m("p", "Abot makes it easy to add support for multiple communication tools, including SMS, phone, email, Slack, etc. In this guide, we'll learn how to set up SMS, so we can communicate with this new digital assistant via text messages."),
			m("p", "First we'll need an SMS provider. We'll use Twilio, but you can use any provider with some modifications to Abot's code."),
			m("p", [
				"Sign up for Twilio here: ",
				m("a[href=https://www.twilio.com/]", "https://www.twilio.com/"),
				". Take note of your assigned account SID, auth token, and Twilio phone number. You'll want to set the following environment variables in your ~/.bash_profile or ~/.bashrc:",
			]),
			m("code", [
				m(".line", "export TWILIO_ACCOUNT_SID=\"REPLACE\""),
				m(".line", "export TWILIO_AUTH_TOKEN=\"REPLACE\""),
				m(".line", "export TWILIO_PHONE=\"REPLACE\""),
			]),
			m("p", "Be sure your TWILIO_PHONE is in the form of +13105551234. The leading plus symbol is required."),
			m("p", "In order to communicate with Abot over SMS, Twilio has to be able to reach Abot, but until this point, we've been testing Abot locally on your machine--and Twilio has no way to reach that. Thus, we'll deploy Abot to make it accessible to the world."),

			m("h2", "Deploying your Abot"),
			m("p", [
				"For this guide we'll deploy to Heroku to keep things simple, but Go and Abot make it easy to deploy on any web server. To learn about deploying a Go project on Heroku, first familiarize yourself with this tutorial from Heroku: ",
				m("a[href=https://devcenter.heroku.com/articles/getting-started-with-go]", "Getting Started with Go on Heroku"),
				". Once you have a grasp of what we're doing, open a terminal and run:",
			]),
			m("code", [
				m(".line", "heroku create"),
				m(".line", "heroku config:set TWILIO_ACCOUNT_SID=REPLACE \\"),
				m(".line", "TWILIO_AUTH_TOKEN=REPLACE \\"),
				m(".line", "TWILIO_PHONE=REPLACE"),
				m(".line", "heroku addons:create heroku-postgresql:hobby-dev --version 9.5"),
				m(".line", "heroku pg:psql < db/migrations/up/*.sql"),
				m(".line", "git push heroku master"),
				m(".line", "heroku open"),
			]),
			m("p", [
				"Be sure to replace REPLACE above with your values from before. If everything booted correctly, you'll see the \"Congratulations, you're running Abot!\" screen. If not, you can track down any issues with ",
				m("span.code-inline", "heroku logs --tail"),
				".",
			]),

			m("h2", "Testing out Abot"),
			m("p", [
				"To try Abot, let's first create an Abot account. Go to the site (",
				m("span.code-inline", "heroku open"),
				") and click on Sign Up in the header at the top right. When entering your phone number, be sure to enter it in the format of +13105551234, or Twilio will reject it.",
			]),
			m("p", "Once you've signed up, send Abot a text at your TWILIO_PHONE number from before:"),
			m("code", "Say hi"),
			m("p", "Sometimes responses via Twilio take a few seconds, but you should get a reply back soon,"),
			m("code", "Hello World!"),

			m("h2", "Next steps"),
			m("p", "As next steps, try:"),
			m("ul", [
				m("li", m("a[href=#/]", "Building advanced packages")),
				m("li", [
					"Learning ",
					m("a[href=#/]", "How to Contribute")
				]),
				m("li", [
					"See what's on our ",
					m("a[href=#/]", "Roadmap")
				]),
			])
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
