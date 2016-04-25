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
		xhr.setRequestHeader("Authorization", "Bearer " + cookie.getItem("iaAuthToken"))
		xhr.setRequestHeader("X-CSRF-Token", cookie.getItem("iaCSRFToken"))
	}
	return m.request(opts)
}
// prettyTime is from http://stackoverflow.com/a/7641822
abot.prettyTime = function(time) {
	var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400)
    if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return
	return day_diff == 0 && (
		diff < 60 && "just now" || diff < 120 && "1 minute ago" ||
		diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 &&
		"1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago"
	) || day_diff == 1 && "Yesterday" || day_diff < 7 &&
	day_diff + " days ago" || day_diff < 31 &&
	Math.ceil(day_diff / 7) + " weeks ago"
}
abot.signout = function(ev) {
	ev.preventDefault()
	cookie.removeItem("iaID")
	cookie.removeItem("iaEmail")
	cookie.removeItem("iaIssuedAt")
	cookie.removeItem("iaScopes")
	cookie.removeItem("iaCSRFToken")
	cookie.removeItem("iaAuthToken")
	abot.request({
		url: "/api/users.json",
		method: "DELETE",
	}).then(function() {
		m.route("/login", null, true)
	}, function(err) {
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
