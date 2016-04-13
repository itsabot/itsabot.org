(function(abot) {
abot.successFlash = m.prop("")
abot.isProduction = function() {
	var ms = document.getElementsByTagName("meta")
	for (var i = 0; i < ms.length; i++) {
		if (ms[i].getAttribute("name") === "env-production") {
			return ms[i].getAttribute("content") === "true"
		}
	}
	return false
}
abot.request = function(opts) {
	opts.config = function(xhr) {
		xhr.setRequestHeader("Authorization", "Bearer " + cookie.getItem("authToken"))
		xhr.setRequestHeader("X-CSRF-Token", cookie.getItem("csrfToken"))
	}
	return m.request(opts)
}
abot.signout = function(ev) {
	ev.preventDefault()
	abot.request({
		url: "/api/users.json",
		method: "DELETE",
	}).then(function() {
		cookie.removeItem("id")
		cookie.removeItem("email")
		cookie.removeItem("issuedAt")
		cookie.removeItem("scopes")
		cookie.removeItem("csrfToken")
		cookie.removeItem("authToken")
		m.route("/login")
	}, function(err) {
		console.log(err)
		console.error(err)
	})
}
window.addEventListener("load", function() {
	m.route.mode = "pathname"
	m.route(document.body, "/", {
		"/": abot.Index,
		"/guides": abot.Guides,
		"/plugins": abot.Plugins,
		"/plugins/new": abot.PluginsNew,
		"/login": abot.Login,
		"/signup": abot.Signup,
		"/profile": abot.Profile,
	})
})
})(!window.abot ? window.abot={} : window.abot);
