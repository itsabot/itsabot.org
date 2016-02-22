(function(abot) {
abot.SearchResult = {}
abot.SearchResult.view = function() {
	return m("li", [
		m("a[href=#/]", "github.com/itsabot/pkg_restaurant"),
		" username",
	])
}
})(!window.abot ? window.abot={} : window.abot);
