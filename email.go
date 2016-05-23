package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"github.com/labstack/gommon/log"
)

type email struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Subject string `json:"subject"`
	HTML    string `json:"html"`
	Text    string `json:"text"`
}

func sendWelcomeEmail(to string, name string) {
	data := &email{
		From:    "evan@itsabot.org",
		To:      to,
		Subject: "Welcome to the Abot community!",
		HTML: `<html><body>
			<p>Hey ` + name + `:</p>
			<p>Thanks for taking the time to check out Abot. Let me know if you have any questions, or if there's anything else with which I can help.</p>
			<p>Best,</p>
			<p><div>Evan</div><div>Founder, Abot</div></p>
		</body></html>`,
		Text: `Hey ` + name + `:
		
		Thanks for taking the time to check out Abot. Let me know if you have any questions, or if there's anything else with which I can help.
		
		Best,

		Evan
		Founder, Abot`,
	}
	sendEmail(data)
}

func sendVerificationEmail(to string, name string, code string) {
	data := &email{
		From:    "abot@itsabot.org",
		To:      to,
		Subject: "Verify your email address",
		HTML: `<html><body>
			<p>Hi ` + name + `:</p>
			<p>In order to publish plugins under this email, we'll first have to verify that it's yours. If you signed up to itsabot.org recently, please click the following link:</p>
			<p><a href="https://www.itsabot.org/verify/` + code + `">https://www.itsabot.org/verify/` + code + `</a></p>
			<p>Thanks,</p>
			<p>Abot</p>
		</body></html>`,
		Text: `Hi ` + name + `:
		
		In order to publish plugins under this email, we'll first have to verify that it's yours. If you signed up to itsabot.org recently, please visit the following URL:

		https://www.itsabot.org/verify/` + code + `
		
		Thanks,

		Abot`,
	}
	sendEmail(data)
}

func sendEmail(data *email) {
	client := &http.Client{Timeout: 10 * time.Second}
	u := "https://api:" + os.Getenv("MAILGUN_API_KEY") +
		"@api.mailgun.com/v3/" + os.Getenv("MAILGUN_DOMAIN") +
		"/messages"
	byt, err := json.Marshal(data)
	if err != nil {
		log.Info("failed to marshal welcome email to JSON.", err)
		return
	}
	req, err := http.NewRequest("POST", u, bytes.NewBuffer(byt))
	if err != nil {
		log.Info("failed to send welcome email.", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		log.Info("failed to send welcome email.", err)
		if resp != nil {
			byt, err = ioutil.ReadAll(resp.Body)
			if err != nil {
				log.Info("failed to read mailgun resp body.", err)
				return
			}
			log.Info(string(byt))
		}
		return
	}
	defer func() {
		if err = resp.Body.Close(); err != nil {
			log.Info("failed to close mailgun resp body.", err)
		}
	}()
}
