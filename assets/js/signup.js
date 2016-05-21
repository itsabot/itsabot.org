(function(abot) {
abot.Signup = {}
abot.Signup.controller = function() {
	var ctrl = this
	abot.Login.checkAuth(function(cb) {
		if (cb) {
			return m.route("/profile", null, true)
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
			var date = new Date()
			var exp = date.setDate(date + 30)
			var secure = true
			if (!abot.isProduction()) {
				secure = false
			}
			cookie.setItem("iaID", data.ID, exp, null, null, secure)
			cookie.setItem("iaEmail", data.Email, exp, null, null, secure)
			cookie.setItem("iaIssuedAt", data.IssuedAt, exp, null, null, secure)
			cookie.setItem("iaAuthToken", data.AuthToken, exp, null, null, secure)
			cookie.setItem("iaCSRFToken", data.CSRFToken, exp, null, null, secure)
			cookie.setItem("iaScopes", data.Scopes, exp, null, null, secure)
			m.route("/profile", null, true)
			console.log("routed to profile")
		}, function(err) {
			ctrl.props.error(err.Msg)
		})
	}
}
abot.Signup.view = function(ctrl) {
	var errMsg = null
	if (!!ctrl.props.error()) {
		errMsg = m(".alert.alert-error", ctrl.props.error())
	}
	return m(".dark", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				m("h1.centered.group", "Sign Up"),
				m(".well", [
					m(".well-padding", [
						errMsg,
						m("form", { onsubmit: ctrl.signup }, [
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
							m(".centered", [
								m("input.btn[type=submit][value=Sign up]"),
							]),
						]),
					]),
				]),
				m(".group.centered", [
					m("span", "Have an account? "),
					m("a", {
						href: "/login",
						config: m.route
					}, "Log In")
				]),
			]),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
