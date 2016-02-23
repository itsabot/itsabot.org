(function(abot) {
abot.Footer = {}
abot.Footer.view = function() {
	return m("footer", [
		"Made with ",
		m("span.icon.icon-red", m.trust("&hearts;")),
		" by the Abot Team",
	])
}
})(!window.abot ? window.abot={} : window.abot);
