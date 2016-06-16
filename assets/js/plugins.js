(function(abot) {
abot.Plugins = {}
abot.Plugins.controller = function() {
	var ctrl = this
	ctrl.useDefaultIcon = function(ev) {
		var t = ev.target
		t.setAttribute("src", "/public/images/missing.svg")
		t.classList.add("missing")
	}
	ctrl.clear = function() {
		document.getElementById("searchbar-input").value = ""
		document.getElementById("plugins-start").classList.remove("hidden")
		document.getElementById("search-results").classList.add("hidden")
		ctrl.props.results(ctrl.props.popular())
	}
	ctrl.props = {
		results: m.prop([]),
		popular: m.prop([]),
	}
	m.request({
		method: "GET",
		url: "/api/plugins/popular.json",
	}).then(function(data) {
		if (data != null) {
			ctrl.props.results(data)
			ctrl.props.popular(data)
		}
	}, function(err) {
		console.error(err)
	})
}
abot.Plugins.view = function(ctrl) {
	return m("div", [
		m.component(abot.Header),
		m.component(abot.Searchbar, ctrl),
		m(".main", [
			m("#plugins-start", [
				m("h2", "Popular plugins"),
				m(".plugins", [
					function() {
						var p = ctrl.props.popular()
						var els = []
						for (var i = 0; i < p.length; ++i) {
							if (p[i].Icon.substring(0, 5) !== "https") {
								p[i].Icon = "/public/images/missing.svg"
								p[i].Missing = true
							}
							els.push(m(".plugin", [
								m("a", { href: "/plugins/" + p[i].ID }, [
									m("img", {
										src: p[i].Icon,
										onerror: ctrl.useDefaultIcon,
										"class": p[i].Missing ? "missing" : "",
									}),
									m("div", p[i].Name),
								]),
							]))
						}
						return els
					}(),
				]),
				m("div", [
					m("a.btn-light[href=/plugins/browse]", {
						config: m.route,
					}, "Browse plugins")
				]),
				function() {
					if (abot.isLoggedIn()) {
						return
					}
					return m(".group", [
						m("h2", "Join a growing community of developers."),
						m("ul", [
							m("li", "Publish, share, and train your plugins."),
							m("li", "Get early access to community resources."),
							m("li", "Be the first to try big improvements we're making to Abot."),
						]),
						m("a.btn-light[href=/signup]", { config: m.route }, "Sign up for free"),
					])
				}(),
				m(".group", [
					m("h2", "Getting started"),
					m(".paragraph", m("a[href=/plugins/new]", {
						config: m.route,
					}, m("strong", [
						"Add your plugin to itsabot.org ", m.trust("&raquo;")
					]))),
					m("div", "Submit your plugin to be included in search."),

					m(".paragraph", m("a[href=https://github.com/itsabot/abot/wiki/Building-a-Plugin]", m("strong", [
						"Build a plugin ", m.trust("&raquo;")
					]))),
					m("div", "Learn how to build plugins with branching dialog, complex states, and more."),

					m(".paragraph", m("a[href=https://github.com/itsabot/abot/wiki/Using-the-Plugin-Manager]", m("strong", [
						"Integrate a plugin ", m.trust("&raquo;")
					]))),
					m("div", "Learn to use the plugin manager to add plugins to your Abot."),
				]),
			]),
			m("#search-results.hidden", [
				m(".content", [
					m("a[href=#/].btn.clear", {
						onclick: ctrl.clear,
					}, "Clear"),
					m("h2[style=display:inline]", "Search results"),
					m("ol.search-results", [
						m.component(abot.SearchResult, ctrl),
					]),
				]),
			]),
			m.component(abot.Footer),
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
