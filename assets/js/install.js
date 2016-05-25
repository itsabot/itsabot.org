(function(abot) {
abot.Install = {}
abot.Install.controller = function() {
	var ctrl = this
	ctrl.hideAll = function() {
		var sections = document.querySelectorAll(".section")
		for (var i = 0; i < sections.length; ++i) {
			sections[i].classList.add("hidden")
		}
	}
	ctrl.showSection = function(ev) {
		ctrl.hideAll()
		var el = ev.target
		if (el.tagName === "IMG") {
			el = el.parentNode.parentNode
		} else if (el.tagName === "DIV") {
			el = el.parentNode
		}
		document.getElementById(el.dataset.section).classList.remove("hidden")
	}
}
abot.Install.view = function(ctrl) {
	return m("div", [
		m.component(abot.Header),
		m(".main", [
			m(".centered", [
				m("h1", "Install Abot"),
				m("p", "Find your operating system and follow the instructions for it."),
				m(".btn-group", [
					m("a.btn-light.btn-left[href=#/]", {
						onclick: ctrl.showSection,
						"data-section": "mac",
					}, [
						m("div", m("img[src=/public/images/logo_apple.svg]")),
						"Mac OS X",
					]),
					m("a.btn-light.btn-left[href=#/]", {
						onclick: ctrl.showSection,
						"data-section": "deb",
					}, [
						m("div", m("img.icon-inline[src=/public/images/logo_ubuntu.svg]")),
						"Debian / Ubuntu",
					]),
					m("a.btn-light.btn-left[href=#/]", {
						onclick: ctrl.showSection,
						"data-section": "windows",
					}, [
						m("div", m("img.icon-inline[src=/public/images/logo_azure.svg]")),
						"Windows",
					]),
					m("a.btn-light.btn-left[href=#/]", {
						onclick: ctrl.showSection,
						"data-section": "standalone",
					}, [
						m("div", m("img.icon-inline]")),
						"Standalone / Other",
					]),
				]),
			]),
			m(".group.hidden.section#mac", [
				m("h2", [
					m("img.icon-inline[src=/public/images/logo_apple.svg]"),
					"Install Abot on Mac OS X",
				]),
				m("p", "To install Abot on Mac OS X, run the following command in your terminal:"),
				m("code", "$ wget -O- https://www.itsabot.org/install_osx.sh | sh"),
				m("p", [
					"This will install Abot along with its dependencies using a Mac package manager called ",
					m("a[href=http://brew.sh/]", "homebrew."),
					" If you do not have homebrew, this script will install it as well. If you'd like to customize the installation, follow the ",
					m("a[href=#/]", {
						onclick: ctrl.showSection,
						"data-section": "standalone",
					}, "standalone instructions."),
				]),
				m("p", [
					"Once you've installed Abot, run: ",
					m("code", "abot server"),
					" and open ",
					m("a[href=http://localhost:4200]", "http://localhost:4200."),
				]),
			]),
			m(".group.hidden.section#deb", [
				m("h2", [
					m("img.icon-inline[src=/public/images/logo_ubuntu.svg]"),
					"Install Abot on Debian/Ubuntu",
				]),
				m("p", "To install Abot on Debian, Ubuntu, or other Debian-flavored variants, run the following command in your terminal:"),
				m("code", "$ wget -O- https://www.itsabot.org/install_deb.sh | sh"),
				m("p", [
					"This will install Abot along with its dependencies (Go 1.6+, Postgres 9.5+). If you'd like to customize the install, you can follow the ",
					m("a[href=#/]", {
						onclick: ctrl.showSection,
						"data-section": "standalone",
					}, "standalone instructions."),
				]),
				m("p", [
					"Once you've installed Abot, run: ",
					m("code", "abot server"),
					" and open ",
					m("a[href=http://localhost:4200]", "http://localhost:4200."),
				]),
			]),
			m(".group.hidden.section#windows", [
				m("h2", [
					m("img.icon-inline[src=/public/images/logo_azure.svg]"),
					"Windows (Unsupported)",
				]),
				m("p", "Windows is not currently supported, although we'd like to support the platform. We'd greatly appreciate any patches to make Windows support a reality. In the meantime, if you're just getting started with Abot, we recommend Ubuntu."),
				m("p", [
					"If you'd like to contribute patches for Windows support, you can do that through pull requests on our ",
					m("a[href=https://github.com/itsabot/abot]", "GitHub repo."),
				]),
			]),
			m(".group.hidden.section#standalone", [
				m("h2", "Standalone / Other"),
				m("p", [
					"If you're using an operating system that's not listed, or if you'd list to customize the install, you can find our installation instructions in our ",
					m("a[href=https://github.com/itsabot/abot#installation]", "README file on Github."),
					" You'll have to install Abot's dependencies (Go 1.6+, Postgres 9.5+) yourself, but Abot's installation should be straightforward."
				]),
				m(".group", [
					m("a.btn-light[href=https://github.com/itsabot/abot#installation]", "View the standalone install instructions")
				]),
			]),
		]),
		m.component(abot.Footer),
	])
}
})(!window.abot ? window.abot={} : window.abot);
