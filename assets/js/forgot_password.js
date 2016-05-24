(function(abot) {
abot.ForgotPassword = {
}
abot.ForgotPassword.controller = function() {
	if (abot.isLoggedIn()) {
		return m.route("/profile", null, true)
	}
	var ctrl = this
	ctrl.submit = function(ev) {
		ev.preventDefault()
		m.request({
			url: "/api/users/forgot_password.json",
			method: "POST",
			data: ctrl.props.email(),
		}).then(function() {
			sessionStorage.setItem("forgot_password", "reset_email_sent")
			m.route("/login")
		}, function(err) {
			ctrl.props.error(err.Msg)
		})
	}
	ctrl.props = {
		email: m.prop(""),
		error: m.prop(""),
	}
}
abot.ForgotPassword.view = function(ctrl) {
	return m(".dark", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				m("h1.centered.group", "Forgot Password"),
				m(".well", [
					m(".well-padding", [
						function() {
							if (ctrl.props.error().length === 0) {
								return
							}
							return m(".alert.alert-error", ctrl.props.error())
						}(),
						m("form", { onsubmit: ctrl.submit }, [
							m("div", "We'll send an email with a link to reset your password."),
							m(".content", [
								m("input[type=email]", {
									placeholder: "Email",
									value: ctrl.props.email(),
									onchange: m.withAttr("value", ctrl.props.email),
								}),
							]),
							m(".centered", [
								m("input.btn[type=submit][value=Send reset email]"),
							]),
						]),
					]),
				]),
			]),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
