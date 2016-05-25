(function(abot) {
abot.PluginsInstall = {}
abot.PluginsInstall.controller = function() {
	var ctrl = this
	ctrl.useDefaultIcon = function(ev) {
		ev.target.setAttribute("src", "/public/images/missing.svg")
	}
	ctrl.props = {
		name: m.prop(""),
		path: m.prop(""),
		description: m.prop(""),
		downloadCount: m.prop(""),
		maintainer: m.prop(""),
		abotVersion: m.prop(0.0),
		icon: m.prop(""),
		options: m.prop([]),
		error: m.prop(""),
	}
	m.request({
		url: "/api/plugins/show/"+m.route.param("id"),
	}).then(function(resp) {
		ctrl.props.name(resp.Name)
		ctrl.props.path(resp.Path)
		ctrl.props.description(resp.Description)
		ctrl.props.downloadCount(resp.DownloadCount)
		ctrl.props.maintainer(resp.Maintainer)
		ctrl.props.abotVersion(resp.AbotVersion)
		ctrl.props.icon(resp.Icon || "")
		ctrl.props.options(resp.Options || [])
	}, function(err) {
		ctrl.props.error(err.Msg)
	})
}
abot.PluginsInstall.view = function(ctrl) {
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
				m("h1.content", [
					m("img.icon-inline.icon-inline-lg", {
						src: ctrl.props.icon(),
						onerror: ctrl.useDefaultIcon,
					}),
					ctrl.props.name(),
				]),
				m(".group", [
					m("p", ctrl.props.description()),
				]),

				m("h3.group", "Install this plugin"),
				m("ol", [
					m("li", [
						"Add the following to your plugins.json under Dependencies: ",
						m("code", '"' + ctrl.props.path() + '": "*"'),
					]),
					m("li", [
						"Run ",
						m("code", "abot plugin install"),
						".",
					]),
					function() {
						if (ctrl.props.options().length === 0) {
							return
						}
						return m("li", [
							"Edit within ",
						])
					}(),
				]),

				m("h3.group", "Info"),
				m("div", "Compatible with Abot v" + ctrl.props.abotVersion()),
				m("div", "Downloads: " + ctrl.props.downloadCount()),
				m("div", [
					"Plugin URL: ",
					m("a", {
						href: "https://" + ctrl.props.path(),
					}, "https://" + ctrl.props.path()),
				]),
				function() {
					if (ctrl.props.maintainer() == null) {
						return
					}
					return m("a.btn-light.content", {
						href: "mailto:" + ctrl.props.maintainer(),
					}, "Contact the maintainer")
				}(),
			]),
		]),
		m.component(abot.Footer),
	])
}
})(!window.abot ? window.abot={} : window.abot);
