(function(abot) {
abot.ResetPassword = {
}
abot.ResetPassword.controller = function() {
	if (abot.isLoggedIn()) {
		return m.route("/profile", null, true)
	}
	var ctrl = this
	ctrl.focus = function(el) {
	}
	ctrl.submit = function(ev) {
		ev.preventDefault()
		if (ctrl.props.password() !== ctrl.props.passwordConfirm()) {
			ctrl.props.error("Your password confirmation doesn't match.")
			return
		}
		m.request({
			url: "/api/users/reset_password.json",
			method: "POST",
			data: {
				Email: m.route.param("email"),
				Code: m.route.param("code"),
				Password: ctrl.props.password(),
			}
		}).then(function() {
			sessionStorage.setItem("forgot_password", "reset_email_complete")
			return m.route("/login", null, true)
		}, function(err) {
			ctrl.props.error(err.Msg)
		})
	}
	ctrl.props = {
		password: m.prop(""),
		passwordConfirm: m.prop(""),
		error: m.prop(""),
	}
}
abot.ResetPassword.view = function(ctrl) {
	return m(".dark", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				m("h1.centered.group", "Reset Password"),
				m(".well", [
					m(".well-padding", [
						function() {
							if (ctrl.props.error().length === 0) {
								return
							}
							return m(".alert.alert-error", ctrl.props.error())
						}(),
						m("form", { onsubmit: ctrl.submit }, [
							m(".content", [
								m("div", [
									m("input[type=password]", {
										config: ctrl.focus,
										placeholder: "New password",
										onchange: m.withAttr("value", ctrl.props.password),
									}),
								]),
								m("div", [
									m("input[type=password]", {
										placeholder: "New password (confirm)",
										onchange: m.withAttr("value", ctrl.props.passwordConfirm),
									}),
								]),
							]),
							m(".centered", [
								m("input.btn[type=submit][value=Reset password]"),
							]),
						]),
					]),
				]),
			]),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
