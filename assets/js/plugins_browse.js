(function(abot) {
abot.PluginsBrowse = {}
abot.PluginsBrowse.controller = function() {
	var ctrl = this
	ctrl.useDefaultIcon = function(ev) {
		ev.target.setAttribute("src", "/public/images/missing.svg")
	}
	ctrl.props = {
		count: m.prop(0),
		plugins: m.prop([]),
	}
	var page = m.route.param("page")
	if (page == null) {
		page = 0
	}
	m.request({
		method: "GET",
		url: "/api/plugins/browse/" + page,
	}).then(function(data) {
		if (data != null) {
			ctrl.props.count(data.Count)
			ctrl.props.plugins(data.Plugins)
		}
	}, function(err) {
		console.error(err)
	})
}
abot.PluginsBrowse.view = function(ctrl) {
	var page = m.route.param("page")
	if (page == null) {
		page = 0
	} else {
		page = parseInt(page)
	}
	var showing = page+1*10
	if (showing > ctrl.props.count()) {
		showing = ctrl.props.count()
	}
	return m("div", [
		m.component(abot.Header),
		m(".main", [
			m("#plugins-start", [
				m("h2", "Browse plugins"),
				m("div", "Showing " + showing + " of " + ctrl.props.count()),
				m(".plugins", [
					function() {
						var p = ctrl.props.plugins()
						var els = []
						for (var i = 0; i < p.length; ++i) {
							if (p[i].Icon == null || p[i].Icon.substring(0, 5) !== "https") {
								p[i].Icon = "/public/images/missing.svg"
								p[i].Missing = true
							}
							els.push(m(".plugin-browse", [
								m("a", {
									href: "/plugins/" + p[i].ID,
									config: m.route,
								}, [
									m(".plugin-browse-left", [
										m("img.plugin-browse-icon", {
											src: p[i].Icon,
											onerror: ctrl.useDefaultIcon,
											"class": p[i].Missing ? "missing" : "",
										}),
									]),
									m(".plugin-browse-right", [
										m("h3", p[i].Name),
										m("p", p[i].Description),
									]),
								]),
							]))
						}
						return els
					}(),
				]),
				function() {
					var els = []
					if (page > 0) {
						els.push(m("a.btn-light.btn-left", {
							href: "/plugins/browse/" + (page-1),
							config: m.route,
						}, "Prev"))
					} else if (ctrl.props.plugins().length === 10) {
						els.push(m("a.btn-light", {
							href: "/plugins/browse/" + (page+1),
							config: m.route,
						}, "Next"))
					}
					return m("div", els)
				}(),
			]),
			m.component(abot.Footer),
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
