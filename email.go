package main

import (
	"encoding/base64"
	"net/url"
	"os"

	"github.com/itsabot/abot/core/log"
	"github.com/mailgun/mailgun-go"
)

type email struct {
	From    string
	To      string
	Subject string
	HTML    string
	Text    string
}

var authMailgun = base64.StdEncoding.EncodeToString([]byte("api:" +
	os.Getenv("MAILGUN_API_KEY")))

func sendWelcomeEmail(to, name string) {
	data := &email{
		From:    "Evan <evan@itsabot.org>",
		To:      to,
		Subject: "Welcome to the Abot community!",
		Text: `Hey ` + name + `:

		Thanks for taking the time to check out Abot. I'm here if you have any questions getting up and running or if there's anything else you need.

		Best,

		Evan
		Founder | Abot
		+1 (424) 265-9007`,
		HTML: `<html><body>
			<p>Hey ` + name + `:</p>
			<p>Thanks for taking the time to check out Abot! I'm here if you have any questions getting up and running or if there's anything else you need.</p>
			<p>Best,</p>
			<p><div>Evan</div><div>Founder | <a href="` + os.Getenv("ITSABOT_URL") + `">Abot</a></div><div>+1 (424) 265-9007</div></p>
		</body></html>`,
	}
	sendEmail(data)
}

func sendVerificationEmail(to, name, code string, id uint64) {
	data := &email{
		From:    "Abot <abot@itsabot.org>",
		To:      to,
		Subject: "Verify your email address",
		HTML: `<html><body>
			<p>Hi ` + name + `:</p>
			<p>In order to publish plugins under this email, we first have to verify that it's your email. If you signed up on itsabot.org recently, please click the following link:</p>
			<p><a href="` + os.Getenv("ITSABOT_URL") + `/verify?code=` + code + `">` + os.Getenv("ITSABOT_URL") + `/verify?code=` + code + `</a></p>
			<p>Thanks,</p>
			<p>Abot</p>
		</body></html>`,
		Text: `Hi ` + name + `:

		In order to publish plugins under this email, we first have to verify that it's your email. If you signed up on itsabot.org recently, please visit the following URL:

		` + os.Getenv("ITSABOT_URL") + `/verify/` + code + `

		Thanks,

		Abot`,
	}
	sendEmail(data)
}

func sendPasswordResetEmail(to, name, code string) {
	toURL := url.QueryEscape(to)
	data := &email{
		From:    "Abot <abot@itsabot.org>",
		To:      to,
		Subject: "Reset your password",
		Text: `Hi ` + name + `:

		Someone recently requested a password reset for your account. If that was you, please visit this link:

		` + os.Getenv("ITSABOT_URL") + `/reset_password?code=` + code + `&email=` + toURL + `

		That link will expire in 30 minutes. If you didn't request a password reset, you can ignore this email.

		Best,

		The Abot team`,
		HTML: `<html><body>
			<p>Hi ` + name + `:</p>
			<p>Someone recently requested a password reset for your account. If that was you, please visit this link:</p>
			<p>` + os.Getenv("ITSABOT_URL") + `/reset_password?code=` + code + `&email=` + toURL + `</p>
			<p>That link will expire in 30 minutes. If you didn't request a password reset, you can ignore this email.</p>
			<p>Best,</p>
			<p>The Abot team</p>
		</body></html>`,
	}
	sendEmail(data)
}

func sendEmail(data *email) {
	mg := mailgun.NewMailgun(os.Getenv("MAILGUN_DOMAIN"), os.Getenv("MAILGUN_API_KEY"), "")
	m := mailgun.NewMessage(data.From, data.Subject, data.Text, data.To)
	m.SetHtml(data.HTML)
	_, _, err := mg.Send(m)
	if err != nil {
		log.Info("failed sending email.", err)
		return
	}
}
