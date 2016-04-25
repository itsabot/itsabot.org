(function(abot) {
abot.Profile = {}
abot.Profile.controller = function() {
	abot.Login.checkAuth(function(loggedIn) {
		if (!loggedIn) {
			return m.route("/login", null, true)
		}
	})
	var ctrl = this
	ctrl.data = function() {
		return abot.request({
			method: "GET",
			url: "/api/user.json",
		})
	}
	ctrl.generateToken = function(ev) {
		ev.preventDefault()
		abot.request({
			method: "POST",
			url: "/api/users/auth_token.json",
		}).then(function(resp) {
			ctrl.props.tokens().push(resp)
			ctrl.props.errorToken("")
			ctrl.props.successToken("Success! Generated token.")
		}, function(err) {
			ctrl.props.successToken("")
			ctrl.props.errorToken("Error! Failed to generate token. " + err.Msg)
		})
	}
	ctrl.props = {
		results: m.prop([]),
		tokens: m.prop([]),

		// Success and error blocks related to plugins
		success: m.prop(""),
		error: m.prop(""),

		// Success and error blocks related to tokens
		successToken: m.prop(""),
		errorToken: m.prop(""),
	}
	var interval
	ctrl.refresh = function() {
		ctrl.data().then(function(data) {
			if (ctrl.props.success().length > 0) {
				if (interval == null) {
					console.log("scheduling refresh")
					interval = setInterval(ctrl.refresh, 1500)
				} else {
					console.log("clearing interval")
					clearInterval(interval)
				}
			}
			ctrl.props.error("")
			ctrl.props.results(data.Plugins || [])
			ctrl.props.tokens(data.Tokens || [])
		}, function(err) {
			ctrl.props.error(err.Msg)
		})
	}
	ctrl.refresh()
}
abot.Profile.view = function(ctrl) {
	return m("div", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				m("h1", "Profile - " + cookie.getItem("iaEmail")),
				function() {
					if (ctrl.props.error().length > 0) {
						return m("#err.alert.alert-error", ctrl.props.error())
					} else if (ctrl.props.success().length > 0) {
						return m("#success.alert.alert-success", ctrl.props.success())
					}
				}(),
				m("h2", "Your plugins"),
				m.component(abot.SearchResult, ctrl),
				m("a[href=/plugins/new].btn.btn-styled", {
					config: m.route,
				}, "+ Add plugin"),
				m("h2", "Auth tokens"),
				function() {
					if (ctrl.props.errorToken().length > 0) {
						return m("#err.alert.alert-error", ctrl.props.errorToken())
					} else if (ctrl.props.successToken().length > 0) {
						return m("#success.alert.alert-success", ctrl.props.successToken())
					}
				}(),
				m("p", "Auth tokens enable you to modify your plugins via external services. Only give your auth tokens to services you trust."),
				m("p", "You should use a unique token to authenticate into each external service."),
				function() {
					if (ctrl.props.tokens().length === 0) {
						return
					}
					return m("table", [
						m("thead", [
							m("tr", [
								m("td", ""),
								m("td", "Token"),
								m("td.hidden-small", "Created"),
							]),
						]),
						m("tbody", [
							ctrl.props.tokens().map(function(token, i) {
								token.Idx = i
								return m(abot.TableItemToken, ctrl, token)
							})
						]),
					])
				}(),
				m("input.btn[type=button]", {
					value: "Generate Auth Token",
					onclick: ctrl.generateToken,
				}),
			]),
		]),
		m.component(abot.Footer),
	])
}
})(!window.abot ? window.abot={} : window.abot);
