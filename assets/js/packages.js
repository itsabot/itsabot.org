(function(abot) {
abot.Packages = {}
abot.Packages.controller = function() {
	var ctrl = this
	ctrl.clearSearch = function() {
		// TODO
		document.getElementById("searchbar-input").value = ""
	}
}
abot.Packages.view = function(ctrl) {
	return m("div", [
		m.component(abot.Header),
		m.component(abot.Searchbar),
		m(".main", [
			m(".content", [
				m("h2", "Popular packages"),
				m(".focusbox", [
					m(".focusbox-third.focusbox-icon", [
						m("h4", m("a[href=#/]", "Restaurant")),
						m(".description", "Search for restaurants nearby using Yelp. Find reviews, menus, and more."),
						m(".link", [
							m("a[href=#/]", [
								"View package ",
								m.trust("&raquo;"),
							]),
						]),
					]),
					m(".focusbox-third.focusbox-icon", [
						m("h4", m("a[href=#/]", "Mechanic")),
						m(".description", "Fix a broken car with searches for nearby mechanics."),
						m(".link", [
							m("a[href=#/]", [
								"View package ",
								m.trust("&raquo;"),
							]),
						]),
					]),
					m(".focusbox-third.focusbox-icon", [
						m("h4", m("a[href=#/]", "Purchase")),
						m(".description", "Add support for credit card purchasing via Stripe."),
						m(".link", [
							m("a[href=#/]", [
								"View package ",
								m.trust("&raquo;"),
							]),
						]),
					]),
				]),
			]),
			m(".content", [
				m("h2", "Getting started"),
				m(".paragraph", m("a[href=#/]", m("strong", "Integrate a package"))),
				m("div", "Learn how to add packages to your Abot."),

				m(".paragraph", m("a[href=#/]", m("strong", "Build a package"))),
				m("div", "Learn how to add packages to your Abot."),

				m(".paragraph", m("a[href=#/]", m("strong", "Package API"))),
				m("div", "Learn how to add packages to your Abot."),
			]),
			m(".content", [
				m("a[href=#/].btn.clear", {
					onclick: ctrl.clearSearch,
				}, "Clear"),
				m("h2[style=display:inline]", "Search results"),
				m("ol.search-results", [
					m.component(abot.SearchResult),
				]),
			]),
			m.component(abot.Footer),
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
