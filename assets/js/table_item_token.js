(function(abot) {
abot.TableItemToken = {}
abot.TableItemToken.controller = function(pctrl, args) {
	var ctrl = this
	ctrl.deleteToken = function() {
		var c = confirm("Are you sure you want to delete this token?")
		if (!c) {
			ev.preventDefault()
			return
		}
		// Remove the row from the table
		this.parentNode.parentNode.remove()
		abot.request({
			url: "/api/users/auth_token.json",
			method: "DELETE",
			data: { Token: ctrl.props.token().Token },
		}).then(function() {
			pctrl.props.successToken("Success! Deleted token.")
		}, function(err) {
			pctrl.props.errorToken("Error! Failed to delete token. Err: " + err.Msg)
		})
	}
	ctrl.props = { token: m.prop(args) }
}
abot.TableItemToken.view = function(ctrl, _, args) {
	var t = ctrl.props.token()
	return m("tr", { key: t.Token }, [
		m("td", m("a[href=#/].btn-x", { onclick: ctrl.deleteToken }, "X")),
		m("td", t.Token),
		m("td.hidden-small", m("small", abot.prettyTime(t.CreatedAt))),
	])
}
})(!window.abot ? window.abot={} : window.abot);
