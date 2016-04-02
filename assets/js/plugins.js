(function(abot) {
abot.Plugins = {}
abot.Plugins.controller = function() {
	var ctrl = this
	ctrl.props = {
		results: m.prop([]),
		popular: m.prop([]),
	}
	ctrl.clear = function() {
		document.getElementById("searchbar-input").value = ""
		document.getElementById("plugins-start").classList.remove("hidden")
		document.getElementById("search-results").classList.add("hidden")
		ctrl.props.results(ctrl.props.popular())
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
				m(".content", [
					m("h2", "Popular plugins"),
					m.component(abot.SearchResult, ctrl),
				]),
				m(".content", [
					m("h2", "Getting started"),
					m(".paragraph", m("a[href=/plugins/new]", m("strong", [
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
