(function(abot) {
abot.SearchResult = {}
abot.SearchResult.controller = function(pctrl) {
	var ctrl = this
	ctrl.viewPlugin = function(id) {
		m.route("/plugins/"+id)
	}
	ctrl.deletePlugin = function(id) {
		abot.request({
			method: "DELETE",
			url: "/api/plugins.json",
			data: { PluginID: id },
		}).then(function() {
			m.route("/profile", null, true)
		}, function(err) {
			console.error(err)
		})
	}
}
abot.SearchResult.view = function(ctrl, pctrl) {
	return function() {
		if (pctrl.props.results().length === 0) {
			return m("table", [
				m("tr", {
					style: "border-bottom: none;"
				}, m("td", [
					"No results found. If you don't see your plugin, you can ",
					m("a[href=/plugins/new]", "add it here."),
				]))
			])
		}
		return m("table", [
			m("thead", [
				m("tr", [
					m("td", "Name"),
					m("td.hidden-small", "Description"),
					m("td.hidden-small", "Downloads"),
					m("td.hidden-small", "Published"),
				]),
			]),
			m("tbody", [
				pctrl.props.results().map(function(plugin) {
					return m("tr", {
						onclick: ctrl.viewPlugin.bind(undefined, plugin.ID),
					}, [
						m("td", [
							m("div", plugin.Name),
							m("small", plugin.Path),
						]),
						m("td.hidden-small", plugin.Description),
						m("td.hidden-small.center", plugin.DownloadCount),
						function() {
							var val
							if (plugin.Error) {
								val = m("span.badge.badge-error", "Not Published")
							} else {
								val = m("span.badge.badge-success", "Published")
							}
							return m("td.badge-container.hidden-small", val)
						}(),
						m("td", function() {
							if (plugin.Error) {
								return m("button", {
									onclick: ctrl.deletePlugin.bind(undefined, plugin.ID),
								}, "Remove")
							}
						}()),
					])
				}),
			]),
		])
	}()
}
})(!window.abot ? window.abot={} : window.abot);
