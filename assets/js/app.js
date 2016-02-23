(function(abot) {
window.addEventListener("load", function() {
	m.route.mode = "pathname"
	m.route(document.body, "/", {
		"/": abot.Index,
		"/guides": abot.Guides,
		"/packages": abot.Packages,
		"/packages/new": abot.PackagesNew,
	})
})
})(!window.abot ? window.abot={} : window.abot);
