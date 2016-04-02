(function(abot) {
abot.Login = {}
abot.Login.controller = function() {
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
			cookie.setItem("id", data.ID, exp, null, null, secure)
			cookie.setItem("email", data.Email, exp, null, null, secure)
			cookie.setItem("issuedAt", data.IssuedAt, exp, null, null, secure)
			cookie.setItem("authToken", data.AuthToken, exp, null, null, secure)
			cookie.setItem("csrfToken", data.CSRFToken, exp, null, null, secure)
			cookie.setItem("scopes", data.Scopes, exp, null, null, secure)
			if (m.route.param("r") == null) {
				return m.route("/profile")
			}
			m.route(decodeURIComponent(m.route.param("r")).substr(1))
		}, function(err) {
			ctrl.showError(err.Msg)
		})
	}
	abot.Login.checkAuth(function(loggedIn) {
		if (loggedIn) {
			return m.route("/profile")
		}
	})
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
	return m("div", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				m("h1", "Log In"),
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
					m("div", [
						m("a", {
							href: "/forgot_password",
							config: m.route
						}, "Forgot password?")
					]),
					m("div", [
						m("input", {
							class: "btn btn-sm",
							id: "btn",
							type: "submit",
							value: "Log In"
						}),
					]),
				]),
				m("div", [
					m("span", "No account? "),
					m("a", {
						href: "/signup",
						config: m.route
					}, "Sign Up"),
				]),
			]),
		]),
		m.component(abot.Footer),
	])
}
abot.Login.checkAuth = function(callback) {
	var id = cookie.getItem("id")
	var issuedAt = cookie.getItem("issuedAt")
	var email = cookie.getItem("email")
	if (id != null && id !== "undefined" && id !== "null" &&
		issuedAt != null && issuedAt !== "undefined" && issuedAt !== "null" &&
		email != null && email !== "undefined" && issuedAt !== "null") {
		return callback(true)
	}
	cookie.setItem("id", null)
	cookie.setItem("issuedAt", null)
	cookie.setItem("email", null)
	cookie.setItem("scopes", null)
	cookie.setItem("authToken", null)
	cookie.setItem("csrfToken", null)
	return callback(false)
}
})(!window.abot ? window.abot={} : window.abot);
