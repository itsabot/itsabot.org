(function(abot) {
abot.Packages = {}
abot.Packages.controller = function() {
	var ctrl = this
	ctrl.clear = function() {
		document.getElementById("searchbar-input").value = ""
		document.getElementById("packages-start").classList.remove("hidden")
		document.getElementById("search-results").classList.add("hidden")
	}
	ctrl.props = {
		results: m.prop([])
	}
}
abot.Packages.view = function(ctrl) {
	return m("div", [
		m.component(abot.Header),
		m.component(abot.Searchbar, ctrl),
		m(".main", [
			m("#packages-start", [
				m(".content", [
					m("h2", "Popular packages"),
					m(".focusbox", [
						m(".focusbox-third.focusbox-icon", [
							m("h4", m("a[href=#/]", "Restaurant")),
							m(".description", "Search for restaurants nearby using Yelp. Find reviews, menus, and more."),
							m(".link", [
								m("a[href=https://github.com/itsabot/pkg_restaurants]", [
									"View package ",
									m.trust("&raquo;"),
								]),
							]),
						]),
						m(".focusbox-third.focusbox-icon", [
							m("h4", m("a[href=#/]", "Mechanic")),
							m(".description", "Fix a broken car with searches for nearby mechanics."),
							m(".link", [
								m("a[href=https://github.com/itsabot/pkg_mechanic]", [
									"View package ",
									m.trust("&raquo;"),
								]),
							]),
						]),
						m(".focusbox-third.focusbox-icon", [
							m("h4", m("a[href=#/]", "Purchase")),
							m(".description", "Add support for credit card purchasing via Stripe."),
							m(".link", [
								m("a[href=https://github.com/itsabot/pkg_purchase]", [
									"View package ",
									m.trust("&raquo;"),
								]),
							]),
						]),
					]),
				]),
				m(".content", [
					m("h2", "Getting started"),
					m(".paragraph", m("a[href=/packages/new]", m("strong", [
						"Add your package to itsabot.org ", m.trust("&raquo;")
					]))),
					m("div", "Submit your package to be included in search."),

					m(".paragraph", m("a[href=https://github.com/itsabot/abot/wiki/Building-a-Package]", m("strong", [
						"Build a package ", m.trust("&raquo;")
					]))),
					m("div", "Learn how to build packages with branching dialog, complex states, and more."),

					m(".paragraph", m("a[href=https://github.com/itsabot/abot/wiki/Using-the-Package-Manager]", m("strong", [
						"Integrate a package ", m.trust("&raquo;")
					]))),
					m("div", "Learn to use abotp, our package manager, to add packages to your Abot."),
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
