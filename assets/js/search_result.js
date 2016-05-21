(function(abot) {
abot.SearchResult = {}
abot.SearchResult.controller = function(pctrl) {
	var ctrl = this
	ctrl.deletePlugin = function(id) {
		abot.request({
			method: "DELETE",
			url: "/api/plugins.json",
			data: { PluginID: id },
		}).then(function() {
			// TODO improve this using m.prop
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
					m("td.hidden-small", "Errors"),
				]),
			]),
			m("tbody", [
				pctrl.props.results().map(function(plugin) {
					return m("tr", [
						m("td", [
							m("div", plugin.Name),
							m("small", plugin.Path),
						]),
						m("td.hidden-small", plugin.Description.String),
						m("td.hidden-small.center", plugin.DownloadCount),
						function() {
							var val = []
							if (!plugin.CompileOK) {
								val.push(m("span.badge.badge-error", "go get"))
							}
							if (!plugin.VetOK) {
								val.push(m("span.badge.badge-error", "go vet"))
							}
							if (!plugin.TestOK) {
								val.push(m("span.badge.badge-error", "go test"))
							}
							if (val.length === 0) {
								val.push(m("span.badge.badge-success", "OK!"))
							}
							return m("td.badge-container.hidden-small", val)
						}(),
						m("td.text.hidden-small", function() {
							if (plugin.Error != null) {
								return plugin.Error.String
							}
							return ""
						}),
						m("td", function(plugin) {
							if (!plugin.Name) {
								return m("button", {
									onclick: ctrl.deletePlugin.bind(undefined, plugin.ID),
								}, "Remove")
							}
						}(plugin)),
					])
				}),
			]),
		])
	}()
}
})(!window.abot ? window.abot={} : window.abot);
