package main

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/itsabot/abot/core/log"
	"github.com/jmoiron/sqlx"
)

// jsonError builds a simple JSON message from an error type in the format of
// { "Msg": err.Error() }
func jsonError(err error) error {
	tmp := strings.Replace(err.Error(), `"`, "'", -1)
	return errors.New(`{"Msg":"` + tmp + `"}`)
}

func connectDB() (*sqlx.DB, error) {
	var db *sqlx.DB
	var err error
	log.Info("connecting to db...")
	if os.Getenv("ITSABOT_ENV") == "production" {
		db, err = sqlx.Connect("postgres", os.Getenv("ITSABOT_DATABASE_URL"))
	} else {
		log.Debug("ITSABOT_DATABASE_URL not set. using defaults")
		db, err = sqlx.Connect("postgres",
			"user=postgres dbname=itsabot sslmode=disable")
	}
	if err != nil {
		log.Info("failed to connect to db.", err)
		return db, err
	}
	log.Info("connected to db")
	return db, nil
}

func generateTokenBytes(n uint) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		return nil, err
	}
	return b, nil
}

// generateToken is taken from the following URL (May 4, 2016), and licensed by
// its author under MIT.
//
// https://elithrar.github.io/article/generating-secure-random-numbers-crypto-rand/
func generateToken(n uint) (string, error) {
	b, err := generateTokenBytes(n)
	return base64.URLEncoding.EncodeToString(b), err
}
func writeErr(w http.ResponseWriter, msg string) {
	if _, err := w.Write([]byte(msg)); err != nil {
		log.Info("failed to write error", err)
	}
}

// createCSRFToken creates a new token, invalidating any existing token.
func createCSRFToken(uid uint64) (token string, err error) {
	q := `INSERT INTO csrfs (token, userid)
	      VALUES ($1, $2)`
	token, err = generateToken(securityTokenLength)
	if err != nil {
		return "", err
	}
	if _, err := db.Exec(q, token, uid); err != nil {
		return "", err
	}
	return token, nil
}

func checkEnvVars() {
	if len(os.Getenv("MAILGUN_API_KEY")) == 0 {
		log.Fatal("missing env var: MAILGUN_API_KEY")
	}
	if len(os.Getenv("MAILGUN_DOMAIN")) == 0 {
		log.Fatal("missing env var: MAILGUN_DOMAIN")
	}
	if len(os.Getenv("ITSABOT_URL")) == 0 {
		log.Debug("ITSABOT_URL var not set. defaulting to https://itsabot.org")
	}
}

// getAuthToken returns a token used for future client authorization with a CSRF
// token.
func getAuthToken(uid uint64, email string) (header *Header, authToken string,
	err error) {

	header = &Header{
		ID:       uid,
		Email:    email,
		IssuedAt: time.Now().Unix(),
	}
	byt, err := json.Marshal(header)
	if err != nil {
		return nil, "", err
	}
	hash := hmac.New(sha512.New, []byte(os.Getenv("ITSABOT_SECRET")))
	_, err = hash.Write(byt)
	if err != nil {
		return nil, "", err
	}
	authToken = base64.StdEncoding.EncodeToString(hash.Sum(nil))
	return header, authToken, nil
}

func writeErrorBadRequest(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusBadRequest)
	writeError(w, err)
}

func writeErrorInternal(w http.ResponseWriter, err error) {
	log.Info("failed", err)
	w.WriteHeader(http.StatusInternalServerError)
	writeError(w, err)
}

func writeErrorAuth(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusUnauthorized)
	writeError(w, err)
}

func writeError(w http.ResponseWriter, err error) {
	tmp := strings.Replace(err.Error(), `"`, "'", -1)
	errS := struct{ Msg string }{Msg: tmp}
	byt, err := json.Marshal(errS)
	if err != nil {
		log.Info("failed to marshal error", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if _, err = w.Write(byt); err != nil {
		log.Info("failed to write error", err)
	}
}
