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
		xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get("iaAuthToken"))
		xhr.setRequestHeader("X-CSRF-Token", Cookies.get("iaCSRFToken"))
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
	abot.request({
		url: "/api/users.json",
		method: "DELETE",
	})
	Cookies.expire("iaID")
	Cookies.expire("iaEmail")
	Cookies.expire("iaIssuedAt")
	Cookies.expire("iaCSRFToken")
	Cookies.expire("iaAuthToken")
	m.route("/login", null, true)
}
abot.isLoggedIn = function() {
	var id = Cookies.get("iaID")
	var issuedAt = Cookies.get("iaIssuedAt")
	var email = Cookies.get("iaEmail")
	if (id != null && id !== "null" &&
		issuedAt != null && issuedAt !== "null" &&
		email != null && email !== "null") {
		return true
	}
	// If the user isn't logged in, ensure we clean out all cookies.
	Cookies.expire("iaID", null)
	Cookies.expire("iaEmail", null)
	Cookies.expire("iaIssuedAt", null)
	Cookies.expire("iaAuthToken", null)
	return false
}
window.addEventListener("load", function() {
	m.route.mode = "pathname"
	m.route(document.body, "/", {
		"/": abot.Index,
		"/plugins": abot.Plugins,
		"/plugins/browse": abot.PluginsBrowse,
		"/plugins/browse/:page": abot.PluginsBrowse,
		"/plugins/new": abot.PluginsNew,
		"/login": abot.Login,
		"/verify": abot.Verify,
		"/signup": abot.Signup,
		"/profile": abot.Profile,

		// Forgot password asks the user their email and sends an "password
		// reset" link.
		"/forgot_password": abot.ForgotPassword,

		// Reset password changes the user's password, arrived at via the
		// "password reset" link sent from Forgot password.
		"/reset_password": abot.ResetPassword,
	})
})
})(!window.abot ? window.abot={} : window.abot);
