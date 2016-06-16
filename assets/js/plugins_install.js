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
		settings: m.prop([]),
		usage: m.prop([]),
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
		ctrl.props.settings(resp.Settings || [])
		ctrl.props.usage(resp.Usage || [])
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
					m("img.icon-inline", {
						src: ctrl.props.icon(),
						onerror: ctrl.useDefaultIcon,
					}),
					ctrl.props.name(),
				]),

				m("p", {
					style: "margin: 2em 0",
				}, ctrl.props.description()),

				m("h3", "Examples"),
				m("ul.no-style", [
					ctrl.props.usage().map(function(use) {
						return m("li", use)
					}),
				]),

				m("h3", "Install this plugin"),
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
						var s =  ctrl.props.settings()
						if (s.length === 0) {
							return
						}
						return m("li", [
							"Edit the following variables under Settings in your Abot's Admin Panel.",
							m("ul", [
								ctrl.props.settings().map(function(st) {
									return m("li.subtle", st)
								})
							]),
						])
					}(),
				]),

				m("h3", "Info"),
				m("ul.no-style", [
					m("li", "Compatible with Abot v" + ctrl.props.abotVersion()),
					m("li", "Downloads: " + ctrl.props.downloadCount()),
					m("li", [
						"Plugin URL: ",
						m("a", {
							href: "https://" + ctrl.props.path(),
						}, "https://" + ctrl.props.path()),
					]),
					function() {
						if (ctrl.props.maintainer() == null) {
							return
						}
						return m("li", [
							m("a.btn-light.content", {
								href: "mailto:" + ctrl.props.maintainer(),
							}, "Contact the maintainer")
						])
					}(),
				]),
			]),
		]),
		m.component(abot.Footer),
	])
}
})(!window.abot ? window.abot={} : window.abot);
