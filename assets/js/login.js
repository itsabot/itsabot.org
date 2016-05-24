(function(abot) {
abot.Login = {}
abot.Login.controller = function() {
	if (abot.isLoggedIn()) {
		return m.route("/profile", null, true)
	}
	var ctrl = this
	ctrl.focus = function(el) {
		if (document.activeElement.tagName === "BODY") {
			el.focus()
		}
	}
	ctrl.login = function(ev) {
		ev.preventDefault()
		return m.request({
			url: "/api/users/login.json",
			method: "POST",
			data: {
				Email: ctrl.props.email(),
				Password: ctrl.props.password(),
			},
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
			ctrl.props.error(err.Msg)
		})
	}
	ctrl.props = {
		email: m.prop(""),
		password: m.prop(""),
		error: m.prop(""),
	}
}
abot.Login.view = function(ctrl) {
	return m(".dark", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				m("h1.centered.group", "Log In"),
				m(".well", [
					m(".well-padding", [
						function() {
							if (ctrl.props.error().length === 0) {
								return
							}
							return m(".alert.alert-error", ctrl.props.error())
						}(),
						function() {
							var g = sessionStorage.getItem("forgot_password")
							sessionStorage.setItem("forgot_password", null)
							switch (g) {
							case "reset_email_sent":
									return m(".alert.alert-success", "Success! Check your email for a link to reset your password.")
							case "reset_email_complete":
									return m(".alert.alert-success", "Success! We've reset your password. Please log in using your new password.")
							}
						}(),
						m("form", { onsubmit: ctrl.login }, [
							m("div", [
								m("input[type=email]", {
									placeholder: "Email",
									config: ctrl.focus,
									oninput: m.withAttr("value", ctrl.props.email),
								}),
							]),
							m("div", [
								m("input[type=password]", {
									placeholder: "Password",
									oninput: m.withAttr("value", ctrl.props.password),
								}),
							]),
							m(".centered", [
								m("input.btn[type=submit][value=Log In]"),
							]),
						]),
						m(".centered", [
							m("a[href=/forgot_password]", {
								config: m.route,
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
})(!window.abot ? window.abot={} : window.abot);
