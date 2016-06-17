(function(abot) {
abot.PluginsProgress = {}
abot.PluginsProgress.controller = function() {
	var ctrl = this
	var ws = new WebSocket("ws://" + window.location.host + "/api/ws")
	ws.onopen = function() {
		ws.send(m.route.param("secret"))

		// If the first message hasn't been received after 3 seconds of opening
		// the socket connection, something is probably wrong. Usually this is
		// because the user tried to refresh the current page to retry a failed
		// attempt at publishing the plugin, which wouldn't do anything. Thus
		// redirect to the new plugin page to attempt to republish the plugin.
		//
		// TODO simply retry in this case, rather than redirecting
		setTimeout(function() {
			if (!ctrl.props.received()) {
				ws.close()
				var err = encodeURIComponent("Failed to publish the plugin. Please try again.")
				m.route("/plugins/new?e="+err, null, true)
			}
		}, 3000)
	}
	ws.onmessage = function(ev) {
		if (!ctrl.props.received()) {
			ctrl.props.received(true)
		}
		var msg = JSON.parse(ev.data)
		switch (msg.Type) {
		case "success":
			ctrl.props.finished(true)
			setTimeout(function() {
				m.route("/plugins/"+msg.Content, null, true)
			}, 3000)
			return
		case "failed":
			break
		default:
			if (ctrl.props.messages().length === 1) {
				ctrl.props.messages().push({
					Content: "OK",
					Color: "green",
				})
			}
			ctrl.props.messages().push(msg)
			m.redraw(true)
		}
	}
	ws.onclose = function(ev) {
		if (!ctrl.props.finished()) {
			ctrl.props.messages().push({
				Content: "Server hung up. Please try again",
				Color: "red",
			})
		}
	}
	ctrl.props = {
		pluginID: m.prop(0),
		messages: m.prop([]),
		error: m.prop(""),
		received: m.prop(false),
		finished: m.prop(false),
	}
	ctrl.props.messages().push({
		Content: "> Establishing connection with server...",
		Color: "",
	})
}
abot.PluginsProgress.view = function(ctrl) {
	return m("div", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				function() {
					if (ctrl.props.error().length === 0) {
						return
					}
					return m(".alert.alert-error", ctrl.props.error())
				}(),
				m("h1", "Publishing plugin..."),
				m("code.dark", [
					ctrl.props.messages().map(function(msg, i) {
						return [
							function() {
								if (i > 0) {
									var ss = msg.Content.substring(0, 2)
									if (ss === "> " || ss === "==") {
										return m("br")
									}
								}
							}(),
							m("div", {
								"class": msg.Color,
							}, msg.Content),
						]
					}),
				]),
				m("p", "This page updates automatically. If publishing the plugin succeeds, you'll be redirected to the plugin's page."),
			]),
		]),
		m.component(abot.Footer),
	])
}
})(!window.abot ? window.abot={} : window.abot);
