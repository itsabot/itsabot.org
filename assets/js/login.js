(function(abot) {
abot.Login = {}
abot.Login.controller = function() {
	abot.Login.checkAuth(function(loggedIn) {
		if (loggedIn) {
			return m.route("/profile", null, true)
		}
	})
	var ctrl = this
	ctrl.login = function(ev) {
		ev.preventDefault()
		ctrl.hideError()
		var email = document.getElementById("email").value
		var pass = document.getElementById("password").value
		return m.request({
			method: "POST",
			data: {
				Email: email,
				Password: pass,
			},
			url: "/api/users/login.json",
		}).then(function(data) {
			var date = new Date()
			var exp = date.setDate(date + 30)
			var secure = true
			if (!abot.isProduction()) {
				secure = false
			}
			Cookies.set("iaID", data.ID, exp, null, null, secure)
			Cookies.set("iaEmail", data.Email, exp, null, null, secure)
			Cookies.set("iaIssuedAt", data.IssuedAt, exp, null, null, secure)
			Cookies.set("iaAuthToken", data.AuthToken, exp, null, null, secure)
			Cookies.set("iaCSRFToken", data.CSRFToken, exp, null, null, secure)
			if (m.route.param("r") == null) {
				return m.route("/profile", null, true)
			}
			m.route(decodeURIComponent(m.route.param("r")).substr(1), null, true)
		}, function(err) {
			ctrl.showError(err.Msg)
		})
	}
	ctrl.hideError = function() {
		ctrl.error("")
		document.getElementById("err").classList.add("hidden")
	}
	ctrl.showError = function(err) {
		ctrl.error(err)
		document.getElementById("err").classList.remove("hidden")
	}
	ctrl.error = m.prop("")
}
abot.Login.view = function(ctrl) {
	return m(".dark", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				m("h1.centered.group", "Log In"),
				m(".well", [
					m(".well-padding", [
						m("div", {
							id: "err",
							class: "alert alert-error hidden"
						}, ctrl.error()),
						m("form", { onsubmit: ctrl.login }, [
							m("div", [
								m("input", {
									type: "email",
									id: "email",
									placeholder: "Email"
								}),
							]),
							m("div", [
								m("input", {
									type: "password",
									id: "password",
									placeholder: "Password"
								}),
							]),
							m(".centered", [
								m("input.btn[type=submit][value=Log In]"),
							]),
						]),
						m(".centered", [
							m("a", {
								href: "/forgot_password",
								config: m.route
							}, "Forgot password?")
						]),
					]),
				]),
				m(".group.centered", [
					m("span", "No account? "),
					m("a", {
						href: "/signup",
						config: m.route
					}, "Sign Up"),
				]),
			]),
		]),
	])
}
abot.Login.checkAuth = function(callback) {
	var id = Cookies.get("iaID")
	var issuedAt = Cookies.get("iaIssuedAt")
	var email = Cookies.get("iaEmail")
	if (id != null && id !== "undefined" && id !== "null" &&
		issuedAt != null && issuedAt !== "undefined" && issuedAt !== "null" &&
		email != null && email !== "undefined" && issuedAt !== "null") {
		return callback(true)
	}
	Cookies.expire("iaID")
	Cookies.expire("iaIssuedAt")
	Cookies.expire("iaEmail")
	Cookies.expire("iaAuthToken")
	Cookies.expire("iaCSRFToken")
	return callback(false)
}
})(!window.abot ? window.abot={} : window.abot);
