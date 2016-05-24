(function(abot) {
abot.Signup = {}
abot.Signup.controller = function() {
	if (abot.isLoggedIn()) {
		return m.route("/profile", null, true)
	}
	var ctrl = this
	ctrl.focus = function(el) {
		if (document.activeElement.tagName === "BODY") {
			el.focus()
		}
	}
	ctrl.signup = function(ev) {
		ev.preventDefault()
		return m.request({
			url: "/api/users.json",
			method: "POST",
			data: {
				Email: ctrl.props.email(),
				Password: ctrl.props.password(),
				Name: ctrl.props.name(),
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
			sessionStorage.setItem("verify", true)
			m.route("/profile", null, true)
			console.log("routed to profile")
		}, function(err) {
			ctrl.props.error(err.Msg)
		})
	}
	ctrl.props = {
		name: m.prop(""),
		email: m.prop(""),
		password: m.prop(""),
		error: m.prop(""),
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
								m("input[type=text]", {
									placeholder: "Your name (optional)",
									config: ctrl.focus,
									oninput: m.withAttr("value", ctrl.props.name),
								})
							]),
							m("div", [
								m("input[type=email]", {
									placeholder: "Email",
									oninput: m.withAttr("value", ctrl.props.email),
								})
							]),
							m("div", [
								m("input#password[type=password]", {
									placeholder: "Password",
									oninput: m.withAttr("value", ctrl.props.password),
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
					m("a[href=/login]", { config: m.route }, "Log In")
				]),
			]),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
