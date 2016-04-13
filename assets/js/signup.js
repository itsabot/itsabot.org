(function(abot) {
abot.Signup = {}
abot.Signup.controller = function() {
	var ctrl = this
	abot.Login.checkAuth(function(cb) {
		if (cb) {
			return m.route("/profile")
		}
	})
	ctrl.props = {
		error: m.prop("")
	}
	ctrl.signup = function(ev) {
		ev.preventDefault()
		var email = document.getElementById("email").value
		var pass = document.getElementById("password").value
		return m.request({
			method: "POST",
			data: {
				Email: email,
				Password: pass,
			},
			url: "/api/users.json"
		}).then(function(data) {
			console.log("here")
			var date = new Date()
			var exp = date.setDate(date + 30)
			var secure = true
			if (!abot.isProduction()) {
				secure = false
			}
			console.log("here2")
			cookie.setItem("id", data.ID, exp, null, null, secure)
			cookie.setItem("email", data.Email, exp, null, null, secure)
			cookie.setItem("issuedAt", data.IssuedAt, exp, null, null, secure)
			cookie.setItem("authToken", data.AuthToken, exp, null, null, secure)
			cookie.setItem("csrfToken", data.CSRFToken, exp, null, null, secure)
			cookie.setItem("scopes", data.Scopes, exp, null, null, secure)
			console.log("here3")
			m.route("/profile")
			console.log("routed to profile")
		}, function(err) {
			console.log("error", err)
			ctrl.props.error(err.Msg)
		})
	}
}
abot.Signup.view = function(ctrl) {
	var errMsg = null
	if (!!ctrl.props.error()) {
		errMsg = m(".alert.alert-error", ctrl.props.error())
	}
	return m("div", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				m("h1", "Sign Up"),
				m("form", { onsubmit: ctrl.signup }, [
					errMsg,
					m("div", [
						m("input", {
							type: "email",
							class: "form-control",
							id: "email",
							placeholder: "Email"
						})
					]),
					m("div", [
						m("input", {
							type: "password",
							class: "form-control",
							id: "password",
							placeholder: "Password"
						})
					]),
					m("div", [
						m("input", {
							class: "btn btn-sm",
							id: "btn",
							type: "submit",
							value: "Sign Up"
						})
					]),
					m("div", [
						m("span", "Have an account? "),
						m("a", {
							href: "/login",
							config: m.route
						}, "Log In")
					]),
				]),
			]),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
