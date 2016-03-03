(function(abot) {
abot.Searchbar = {}
abot.Searchbar.controller = function(pctrl) {
	var ctrl = this
	ctrl.focus = function(el) {
		el.focus()
	}
	ctrl.search = function(ev) {
		ev.preventDefault()
		var input = ev.target.children[0]
		if (input.value.length === 0) {
			document.getElementById("plugins-start").classList.remove("hidden")
			document.getElementById("search-results").classList.add("hidden")
			return
		}
		m.request({
			method: "GET",
			url: window.location.origin + "/api/search.json?q=" + input.value
		}).then(function(res) {
			document.getElementById("search-results").classList.remove("hidden")
			document.getElementById("plugins-start").classList.add("hidden")
			res = res || []
			pctrl.props.results(res)
		}, function(err) {
			console.error(err)
		})
	}
}
abot.Searchbar.view = function(ctrl) {
	return m(".searchbar", [
		m(".main", [
			m("form", { onsubmit: ctrl.search }, [
				m("input[type=text]#searchbar-input", {
					placeholder: "Find plugins",
					config: ctrl.focus,
				}),
				m("button[type=submit]", m(".search", m.trust("&#9906;"))),
			])
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
