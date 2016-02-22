(function(abot) {
abot.Searchbar = {}
abot.Searchbar.controller = function() {
	var ctrl = this
	ctrl.focus = function(el) {
		el.focus()
	}
}
abot.Searchbar.view = function(ctrl) {
	return m(".searchbar", [
		m(".main", [
			m("input[type=text]", {
				placeholder: "Find packages",
				config: ctrl.focus,
			}),
			m("button", "Search"),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
