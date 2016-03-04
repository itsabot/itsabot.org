(function(abot) {
window.addEventListener("load", function() {
	m.route.mode = "pathname"
	m.route(document.body, "/", {
		"/": abot.Index,
		"/guides": abot.Guides,
		"/plugins": abot.Plugins,
		"/plugins/new": abot.PluginsNew
	})
})
})(!window.abot ? window.abot={} : window.abot);
