package main

import (
	"crypto/hmac"
	"crypto/sha512"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/itsabot/abot/core/log"
)

type Header struct {
	ID       uint64
	Email    string
	IssuedAt int64
}

// csrf ensures that any forms posted to Abot are protected against Cross-Site
// Request Forgery. Without this function, Abot would be vulnerable to the
// attack because tokens are stored client-side in cookies.
func csrf(w http.ResponseWriter, r *http.Request) bool {
	// TODO look into other session-based temporary storage systems for
	// these csrf tokens to prevent hitting the database.  Whatever is
	// selected must *not* introduce an external (system) dependency like
	// memcached/Redis. Bolt might be an option.
	log.Debug("validating csrf")
	var userID uint64
	q := `SELECT userid FROM csrfs WHERE userid=$1 AND token=$2`
	cookie, err := r.Cookie("iaID")
	if err == http.ErrNoCookie {
		writeErrorAuth(w, err)
		return false
	}
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	uid := cookie.Value
	cookie, err = r.Cookie("iaCSRFToken")
	if err == http.ErrNoCookie {
		writeErrorAuth(w, err)
		return false
	}
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	err = db.Get(&userID, q, uid, cookie.Value)
	if err == sql.ErrNoRows {
		writeErrorAuth(w, errors.New("invalid CSRF token"))
		return false
	}
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	if userID == 0 {
		return false
	}
	log.Debug("validated csrf")
	return true
}

// authToken ensures that a remote Abot has access to perform whichever
// function follows by ensuring the auth tokens passed in match the plugins to
// be modified. This function returns the verified plugin ID authorized to be
// modified. If the plugin could not be verified, the returned bool is false.
func authToken(w http.ResponseWriter, r *http.Request) (uint64, bool) {
	tmp := r.Header.Get("X-Auth-Tokens")
	tokens := strings.Split(tmp, ",")

	tmp2 := r.Header.Get("X-Auth-Plugin-ID")
	pluginID, err := strconv.ParseUint(tmp2, 10, 64)
	if err != nil {
		writeErrorAuth(w, errors.New("Unauthorized to make that change. If you are the plugin's publisher, please connect your account."))
		return 0, false
	}

	var uid string
	q := `SELECT userid FROM plugins WHERE id=$1`
	if err := db.Get(&uid, q, pluginID); err != nil {
		writeErrorAuth(w, err)
		return 0, false
	}
	var count int
	q = `SELECT COUNT(*) FROM authtokens WHERE userid=$1 AND token IN (`
	for i := range tokens {
		tmp := strconv.FormatInt(int64(i+2), 10)
		q += "$" + tmp + ","
	}
	q = q[:len(q)-1] + ")"
	args := make([]interface{}, len(tokens)+1)
	args[0] = uid
	for i := range tokens {
		args[i+1] = tokens[i]
	}
	if err = db.QueryRow(q, args...).Scan(&count); err != nil {
		writeErrorAuth(w, err)
		return 0, false
	}
	if count == 0 {
		writeErrorAuth(w, errors.New("Unauthorized to make that change. If you are the plugin's publisher, please connect your account."))
		return 0, false
	}
	return pluginID, true
}

// loggedIn determines if the user is currently logged in.
func loggedIn(w http.ResponseWriter, r *http.Request) bool {
	log.Debug("validating logged in")

	w.Header().Set("WWW-Authenticate", bearerAuthKey+" realm=Restricted")
	auth := r.Header.Get("Authorization")
	l := len(bearerAuthKey)

	// Ensure client sent the token
	if len(auth) <= l+1 || auth[:l] != bearerAuthKey {
		log.Debug("client did not send token")
		writeErrorAuth(w, errors.New("missing Bearer token"))
		return false
	}

	// Ensure the token is still valid
	cookie, err := r.Cookie("iaIssuedAt")
	if err == http.ErrNoCookie {
		writeErrorAuth(w, err)
		return false
	}
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	if len(cookie.Value) == 0 || cookie.Value == "undefined" {
		writeErrorAuth(w, errors.New("missing issuedAt"))
		return false
	}
	issuedAt, err := strconv.ParseInt(cookie.Value, 10, 64)
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}

	// Expire tokens roughly every three months
	t := time.Unix(issuedAt, 0)
	if t.Add(2190 * time.Hour).Before(time.Now()) {
		log.Debug("token expired")
		writeErrorAuth(w, errors.New("missing Bearer token"))
		return false
	}

	// Ensure the token has not been tampered with
	b, err := base64.StdEncoding.DecodeString(auth[l+1:])
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	cookie, err = r.Cookie("iaID")
	if err == http.ErrNoCookie {
		writeErrorAuth(w, err)
		return false
	}
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	userID, err := strconv.ParseUint(cookie.Value, 10, 64)
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	cookie, err = r.Cookie("iaEmail")
	if err == http.ErrNoCookie {
		writeErrorAuth(w, err)
		return false
	}
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	email, err := url.QueryUnescape(cookie.Value)
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	a := Header{
		ID:       userID,
		Email:    email,
		IssuedAt: issuedAt,
	}
	byt, err := json.Marshal(a)
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	known := hmac.New(sha512.New, []byte(os.Getenv("ITSABOT_SECRET")))
	_, err = known.Write(byt)
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	ok := hmac.Equal(known.Sum(nil), b)
	if !ok {
		log.Info("token tampered for user", userID)
		writeErrorAuth(w, errors.New("Bearer token tampered"))
		return false
	}
	log.Debug("validated logged in")
	return true
}

func expirePasswordResetTokens(d time.Duration) {
	t := time.NewTicker(d)
	select {
	case <-t.C:
		q := `DELETE FROM passwordresets
		      WHERE createdat <= CURRENT_TIMESTAMP - INTERVAL '30 minutes'`
		_, err := db.Exec(q)
		if err != nil {
			log.Info("failed to delete old password reset tokens.", err)
			return
		}
		log.Info("expired password reset tokens")
	}
}
