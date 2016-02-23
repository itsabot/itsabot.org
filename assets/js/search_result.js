(function(abot) {
abot.SearchResult = {}
abot.SearchResult.view = function(_, pctrl) {
	return m("li", [
		m("table", [
			function() {
				if (pctrl.props.results().length === 0) {
					return m("tr", {
						style: "border-bottom: none;"
					}, m("td", [
						"No results found. If you don't see your package, you can ",
						m("a[href=/packages/new]", "add it here."),
					]))
				} else {
					return pctrl.props.results().map(function(item) {
						var url = "https://" + item.Name
						return m("tr", [
							m("td", [
								m("a[href=" + url + "]", item.Name),
								" " + item.Username,
								m(".description", item.Description),
							]),
							m("td", [
								m(".downloads", item.DownloadCount), 
							]),
						])
					})
				}
			}()
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
