(function(abot) {
abot.Verify = {}
abot.Verify.controller = function() {
	if (!abot.isLoggedIn()) {
		var next = encodeURIComponent(window.location.pathname)
		return m.route("/login?r="+next, null, true)
	}
	var ctrl = this
	ctrl.props = {
		error: m.prop(""),
	}
	abot.request({
		url: "/api/users/verify.json",
		method: "POST",
		data: { Code: m.route.param("code") },
	}).then(function() {
		sessionStorage.setItem("verify", "verified")
		m.route("/profile", null, true)
	}, function(err) {
		ctrl.props.error(err.Msg)
	})
}
abot.Verify.view = function(ctrl) {
	return m("div", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				function() {
					if (ctrl.props.error().length === 0) {
						return m("h2.centered", "Verifying...")
					}
					return m(".alert.alert-error", ctrl.props.error())
				}(),
			]),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
