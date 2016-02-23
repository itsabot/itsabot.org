(function(abot) {
abot.SearchResult = {}
abot.SearchResult.view = function() {
	return m("li", [
		m("table", [
			m("tr", [
				m("td", [
					m("a[href=#/]", "github.com/itsabot/pkg_restaurant"),
					" username",
				]),
				m("td", [
					m(".downloads", "20k"), 
				]),
			]),
			m("tr", [
				m("td", [
					m("a[href=#/]", "github.com/itsabot/pkg_restaurant"),
					" username",
				]),
				m("td", [
					m(".downloads", "40k"),
				]),
			]),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
