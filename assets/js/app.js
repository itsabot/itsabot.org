(function(abot) {
window.addEventListener("load", function() {
	m.route.mode = "pathname"
	m.route(document.body, "/", {
		"/": abot.Index,
		"/guides": abot.Guides,
		"/guides/getting_started": abot.GuidesGettingStarted,
		"/guides/advanced_packages": abot.GuidesAdvancedPackages,
	})
})
})(!window.abot ? window.abot={} : window.abot);
