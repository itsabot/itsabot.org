(function(abot) {
window.addEventListener("load", function() {
	m.route.mode = "pathname"
	m.route(document.body, "/", {
		"/": abot.Index,
		"/help": abot.AskForHelp,
		"/guides": abot.Guides,
		"/guides/getting_started": abot.GuidesGettingStarted,
		"/guides/advanced_packages": abot.GuidesAdvancedPackages,
		"/guides/contributing": abot.GuidesContributing,
	})
})
})(!window.abot ? window.abot={} : window.abot);
