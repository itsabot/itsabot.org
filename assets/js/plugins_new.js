(function(abot) {
abot.PluginsNew = {}
abot.PluginsNew.controller = function() {
	var ctrl = this
	ctrl.submit = function(ev) {
		ev.preventDefault()
		document.getElementById("alert-success").classList.add("hidden")
		var submitBtn = document.getElementById("submit-btn")
		submitBtn.setAttribute("disabled", true)
		var u = document.getElementById("username").value
		var r = document.getElementById("reponame").value
		m.request({
			method: "POST",
			url: window.location.origin + "/api/plugins.json",
			data: {
				Path: "github.com/" + u + "/" + r,
			}
		}).then(function(resp) {
			console.log(resp)
			document.getElementById("username").value = ""
			document.getElementById("reponame").value = ""
			document.getElementById("alert-success").classList.remove("hidden")
			submitBtn.removeAttribute("disabled")
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
				m("p", "Manually add to or update a plugin in the itsabot.org index, so it's searchable. You can add any plugin on Github."),
				m("p", [
					"Currently only repos hosted on Github are supported. If you'd like to support another hosting service, please ",
					m("a[href=https://github.com/itsabot/abot/wiki/How-to-Contribute]", "contribute."),
				]),
				m("form", { onsubmit: ctrl.submit }, [
					m(".content", [
						m("#alert-success.alert.alert-success.hidden", [
							m("strong", "Success!"),
							" Added the plugin to itsabot.org. ",
							m("a[href=/plugins]", "Go back to plugins."), 
						]),
						m("#alert-error.alert.alert-error.hidden", [
							m("strong", "Error! "),
							m("span#alert-error-content", ""),
						]),
					]),
					m(".form-el", [
						m("div", [
							m("label[for=username]", "Github username"),
						]),
						m("input[type=text]#username", {
							name: "username",
							placeholder: "itsabot",
						}),
					]),
					m(".form-el", [
						m("div", [
							m("label[for=reponame]", "Repository name"),
						]),
						m("input[type=text]#reponame", {
							name: "reponame",
							placeholder: "pkg_restaurants",
						}),
					]),
					m(".form-el", [
						m("button[type=submit]#submit-btn", "Add plugin")
					]),
				]),
			]),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
