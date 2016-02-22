(function(abot) {
abot.Packages = {}
abot.Packages.view = function() {
	return m("div", [
		m.component(abot.Header),
		m.component(abot.Searchbar),
		m(".main", [
			m(".content", [
				m("ol.search-results", [
					m.component(abot.SearchResult),
				]),
			])
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
