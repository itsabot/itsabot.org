(function(abot) {
abot.PluginsNew = {}
abot.PluginsNew.controller = function() {
	abot.Login.checkAuth(function(loggedIn) {
		if (!loggedIn) {
			return m.route("/login", null, true)
		}
	})
	var ctrl = this
	ctrl.submit = function(ev) {
		ev.preventDefault()
		var submitBtn = document.getElementById("submit-btn")
		submitBtn.setAttribute("disabled", true)
		var r = document.getElementById("repourl").value
		abot.request({
			method: "POST",
			url: window.location.origin + "/api/plugins.json",
			data: { Path: r },
		}).then(function() {
			document.getElementById("repourl").value = ""
			submitBtn.removeAttribute("disabled")
			// TODO improve this with m.prop
			abot.successFlash("Success! Your plugin will appear here when processed (usually in seconds).")
			m.route("/profile", null, true)
		}, function(err) {
			console.error(err)
			document.getElementById("alert-error").classList.remove("hidden")
			document.getElementById("alert-error-content").innerText = err.Msg
			submitBtn.removeAttribute("disabled")
		})
	}
}
abot.PluginsNew.view = function(ctrl) {
	return m("div", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				m("h1", "Add plugin"),
				m("p", "Manually add to or update a plugin in the itsabot.org index, so it's searchable. You can add any plugin available via `go get`."),
				m("form", { onsubmit: ctrl.submit }, [
					m(".content", [
						m("#alert-error.alert.alert-error.hidden", [
							m("strong", "Error! "),
							m("span#alert-error-content", ""),
						]),
					]),
					m(".form-el", [
						m("div", [
							m("label[for=repourl]", "`go get` path"),
						]),
						m("input[type=text]#repourl", {
							name: "repourl",
							placeholder: "github.com/itsabot/plugin_hello",
						}),
						m("div", [
							m("button[type=submit]#submit-btn.btn", "Add plugin")
						]),
					]),
				]),
			]),
		]),
		m.component(abot.Footer),
	])
}
})(!window.abot ? window.abot={} : window.abot);
