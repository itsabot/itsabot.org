(function(abot) {
abot.Profile = {}
abot.Profile.controller = function() {
	abot.Login.checkAuth(function(loggedIn) {
		if (!loggedIn) {
			return m.route("/login")
		}
	})
	var ctrl = this
	ctrl.data = function() {
		return abot.request({
			method: "GET",
			url: "/api/user.json",
		})
	}
	ctrl.showSuccess = function() {
		var sEl = document.getElementById("success")
		if (sEl != null && abot.successFlash().length > 0) {
			sEl.classList.remove("hidden")
		}
	}
	ctrl.hideSuccess = function() {
		var sEl = document.getElementById("success")
		if (sEl != null) {
			sEl.classList.add("hidden")
		}
		abot.successFlash("")
	}
	ctrl.error = m.prop("")
	ctrl.hideError = function() {
		ctrl.error("")
		var errEl = document.getElementById("err")
		if (errEl != null) {
			errEl.classList.add("hidden")
		}
	}
	ctrl.showError = function(err) {
		ctrl.error(err)
		var errEl = document.getElementById("err")
		if (errEl != null) {
			errEl.classList.remove("hidden")
		}
	}
	ctrl.props = {
		results: m.prop([]),
	}
	var interval
	ctrl.refresh = function() {
		ctrl.data().then(function(data) {
			if (abot.successFlash().length > 0) {
				if (interval == null) {
					console.log("scheduling refresh")
					interval = setInterval(ctrl.refresh, 1500)
				} else {
					console.log("clearing interval")
					clearInterval(interval)
				}
			}
			ctrl.hideError()
			if (data != null) {
				ctrl.props.results(data)
			}
		}, function(err) {
			ctrl.showError(err)
		})
	}
	ctrl.refresh()
}
abot.Profile.view = function(ctrl) {
	return m("div", [
		m.component(abot.Header),
		m(".main", [
			m(".content", [
				m("h1", "Profile - " + cookie.getItem("email")),
				m("#err", { class: "alert alert-error hidden" }, ctrl.error()),
				m("h2", "Your plugins"),
				m("#success", {
					class: "alert alert-success hidden",
					config: ctrl.showSuccess,
				}, abot.successFlash()),
				m.component(abot.SearchResult, ctrl),
				m("a[href=/plugins/new].btn.btn-styled", {
					config: m.route,
				}, "+ Add plugin"),
			]),
		]),
		m.component(abot.Footer),
	])
}
})(!window.abot ? window.abot={} : window.abot);
