package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha512"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"text/template"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/itsabot/abot/core/log"
	"github.com/jeffail/tunny"
	"github.com/jmoiron/sqlx"
	"github.com/julienschmidt/httprouter"
	_ "github.com/lib/pq"
)

var tmplLayout *template.Template
var db *sqlx.DB
var pool *tunny.WorkPool

type Header struct {
	ID       uint64
	Email    string
	Scopes   []string
	IssuedAt int64
}

const apiURL = "https://api.github.com/"
const apiWeatherURL = "http://api.openweathermap.org/data/2.5/weather?units=imperial&q="
const securityTokenLength = 128
const bearerAuthKey = "Bearer"
const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const (
	letterIdxBits = 6                    // 6 bits to represent a letter index
	letterIdxMask = 1<<letterIdxBits - 1 // All 1-bits, as many as letterIdxBits
	letterIdxMax  = 63 / letterIdxBits   // # of letter indices fitting in 63 bits
)

func main() {
	var err error
	tmplLayout, err = template.ParseFiles("assets/html/layout.html")
	if err != nil {
		log.Fatal(err)
	}
	db, err = connectDB()
	if err != nil {
		log.Fatal(err)
	}
	log.SetDebug(os.Getenv("ITSABOT_DEBUG") == "true")

	router := httprouter.New()
	router.ServeFiles("/public/*filepath", http.Dir("public"))

	// Route base requests to the single page javascript app.
	router.HandlerFunc("GET", "/", handlerIndex)
	router.NotFound = http.HandlerFunc(handlerIndex)

	// User routes
	router.HandlerFunc("GET", "/api/user.json", handlerAPIUserProfile)
	router.HandlerFunc("POST", "/api/users.json", handlerAPIUserCreate)
	router.HandlerFunc("DELETE", "/api/users.json", handlerAPIUserExpireTokens)
	router.HandlerFunc("POST", "/api/users/login.json", handlerAPIUserLoginSubmit)

	// Plugin routes
	router.Handle("GET", "/api/plugins/search/:q", handlerAPIPluginsSearch)
	router.HandlerFunc("GET", "/api/plugins/popular.json", handlerAPIPluginsPopular)
	router.HandlerFunc("POST", "/api/plugins.json", handlerAPIPluginsCreate)
	router.HandlerFunc("DELETE", "/api/plugins.json", handlerAPIPluginsDelete)
	router.Handle("GET", "/api/weather/:city", handlerAPIWeatherSearch)

	// Create a worker pool to process and test plugins
	pool, err = tunny.CreatePool(runtime.NumCPU(), func(object interface{}) interface{} {
		var compileOK, testOK, vetOK bool
		var p string
		var fi *os.File
		var fileInfo os.FileInfo
		var byt []byte
		var pluginJSON struct {
			Name        *string
			Description *string
		}
		inc := object.(struct {
			Path   string
			userID uint64
		})

		// Remove any extensions like .git
		inc.Path = strings.TrimSuffix(inc.Path, filepath.Ext(inc.Path))

		// go get URL
		log.Info("fetching plugin at", inc.Path)
		outC, err := exec.
			Command("/bin/sh", "-c", "go get "+inc.Path).
			CombinedOutput()
		if err == nil {
			compileOK = true
		} else if err.Error() == "exit status 1" {
			err = fmt.Errorf("Failed to compile plugin %s", inc.Path)
			goto savePlugin
		} else {
			log.Debug(string(outC))
			log.Info("failed to fetch plugins at", inc.Path, err)
			err = fmt.Errorf("Failed to fetch plugins at %s", inc.Path)
			goto savePlugin
		}

		// At the end of this request, delete plugin from server to
		// preserve space
		p = filepath.Join(os.Getenv("GOPATH"), "src", inc.Path)
		defer func() {
			if os.Getenv("ITSABOT_ENV") != "production" {
				return
			}
			outC, err = exec.
				Command("/bin/sh", "-c", "rm -r "+p).
				CombinedOutput()
			if err != nil {
				log.Info("failed to rm", p)
			}
		}()

		// Extract plugin.json
		fi, err = os.Open(filepath.Join(p, "plugin.json"))
		if err != nil {
			log.Info("failed to open plugin.json", err)
			err = errors.New("Plugin must have a plugin.json")
			goto savePlugin
		}
		defer func() {
			if err = fi.Close(); err != nil {
				log.Info("failed to close file", fi.Name())
			}
		}()
		fileInfo, err = fi.Stat()
		if err != nil {
			log.Info("failed to get file stats", err)
			goto savePlugin
		}
		if fileInfo.Size() > 4096 {
			log.Info("plugin.json exceeds max size (4096 bytes). It was %d bytes",
				fileInfo.Size())
			err = errors.New("Plugin must have a plugin.json")
			goto savePlugin
		}
		byt, err = ioutil.ReadAll(fi)
		if err != nil {
			log.Info("failed to read plugin.json", err)
			goto savePlugin
		}
		if err = json.Unmarshal(byt, &pluginJSON); err != nil {
			log.Info("failed to unmarshal plugin.json", err)
			err = errors.New("plugin.json format is invalid")
			goto savePlugin
		}

		// Validate the plugin's Name and Description
		if pluginJSON.Name == nil || len(*pluginJSON.Name) == 0 {
			err = errors.New("plugin.json must have a Name")
			goto savePlugin
		}
		if len(*pluginJSON.Name) > 255 {
			err = errors.New("plugin.json's Name is too long. The max length is 255 characters.")
			goto savePlugin
		}
		if pluginJSON.Description != nil && len(*pluginJSON.Description) > 512 {
			err = errors.New("plugin.json's Description is too long. The max length is 512 characters.")
			goto savePlugin
		}

		// Run tests, go vet
		outC, err = exec.
			Command("/bin/sh", "-c", "go test -short "+inc.Path).
			CombinedOutput()
		if err == nil {
			testOK = true
		} else if err.Error() != "exit status 2" {
			log.Debug(string(outC))
			log.Info("failed to run go test", inc.Path, err)
			goto savePlugin
		}
		outC, err = exec.
			Command("/bin/sh", "-c", "go vet "+inc.Path).
			CombinedOutput()
		if err == nil {
			vetOK = true
		} else {
			log.Debug(string(outC))
			log.Info("failed to run go vet", inc.Path, err)
			goto savePlugin
		}

	savePlugin:
		var errMsg string
		if err != nil {
			errMsg = err.Error()
		}
		// Save the plugin to the database
		q := `INSERT INTO plugins (name, description, downloadcount,
			path, userid, compileok, vetok, testok, error)
		      VALUES ($1, $2, 1, $3, $4, $5, $6, $7, $8)
		      ON CONFLICT (path) DO UPDATE SET
		        name=$1,
			description=$2,
			downloadcount=plugins.downloadcount+1,
			updatedat=CURRENT_TIMESTAMP`
		_, err = db.Exec(q, pluginJSON.Name, pluginJSON.Description,
			inc.Path, inc.userID, compileOK, vetOK, testOK,
			errMsg)
		if err != nil {
			log.Info("failed to save plugin to db", err)
		}
		return nil
	}).Open()
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if err = pool.Close(); err != nil {
			log.Info("failed to close worker pool", err)
		}
	}()

	if len(os.Getenv("ITSABOT_PORT")) > 0 {
		err = http.ListenAndServe(":"+os.Getenv("ITSABOT_PORT"), router)
	} else {
		err = http.ListenAndServe(":"+os.Getenv("PORT"), router)
	}
	if err != nil {
		log.Fatal(err)
	}
}

func handlerIndex(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ITSABOT_ENV") != "production" {
		var err error
		tmplLayout, err = template.ParseFiles("assets/html/layout.html")
		if err != nil {
			log.Fatal(err)
		}
	}
	var s []byte
	data := struct{ IsProd bool }{
		IsProd: os.Getenv("ITSABOT_ENV") == "production",
	}
	b := bytes.NewBuffer(s)
	if err := tmplLayout.Execute(b, data); err != nil {
		log.Info("couldn't execute layout template", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if _, err := w.Write(b.Bytes()); err != nil {
		log.Info("failed to write layout template", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func handlerAPIPluginsPopular(w http.ResponseWriter, r *http.Request) {
	var res []struct {
		ID            uint64
		Name          sql.NullString
		Path          string
		Description   sql.NullString
		DownloadCount uint64
		UserID        uint64
		CompileOK     bool
		VetOK         bool
		TestOK        bool
		Error         sql.NullString
		Similarity    float64 `db:"sml"`
	}
	q := `SELECT id, name, path, description, downloadcount, userid, compileok, vetok, testok, error
	      FROM plugins
	      WHERE name IS NOT NULL
	      ORDER BY downloadcount DESC
	      LIMIT 10`
	if err := db.Select(&res, q); err != nil {
		writeErrorInternal(w, err)
		return
	}
	byt, err := json.Marshal(res)
	if err != nil {
		log.Info("failed to marshal res", err)
		writeErrorInternal(w, err)
		return
	}
	if _, err = w.Write(byt); err != nil {
		log.Info("failed to write bytes", err)
		return
	}
}

func handlerAPIPluginsSearch(w http.ResponseWriter, r *http.Request,
	ps httprouter.Params) {

	term := ps.ByName("q")
	if len(term) < 3 {
		w.WriteHeader(200)
		return
	}
	var res []struct {
		ID            uint64
		Name          sql.NullString
		Path          string
		Description   sql.NullString
		DownloadCount uint64
		UserID        uint64
		CompileOK     bool
		VetOK         bool
		TestOK        bool
		Similarity    float64 `db:"sml"`
	}
	q := `SELECT id, name, path, description, downloadcount, userid, compileok, vetok, testok, similarity((
		SELECT concat(name, description)
		FROM plugins AS ft
		WHERE id=plugins.id), $1
	      ) AS sml
	      FROM plugins
	      WHERE name IS NOT NULL
	      ORDER BY sml DESC, downloadcount DESC
	      LIMIT 10`
	if err := db.Select(&res, q, term); err != nil {
		writeErrorInternal(w, err)
		return
	}

	// Set a 5% similarity minimum, so we don't get odd low scoring matches.
	// Since results are sorted by similarity, we only need to find the
	// first one that's <= 5%, and we can remove everything that follows.
	for i, result := range res {
		if result.Similarity <= 0.05 {
			res = res[:i]
			break
		}
	}
	byt, err := json.Marshal(res)
	if err != nil {
		log.Info("failed to marshal res", err)
		writeErrorInternal(w, err)
		return
	}
	if _, err = w.Write(byt); err != nil {
		log.Info("failed to write bytes", err)
		return
	}
}

func handlerAPIPluginsCreate(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ABOT_ENV") != "test" {
		if !loggedIn(w, r) {
			return
		}
	}
	var inc struct {
		Path   string
		userID uint64 // Important for security that this remains unexported
	}
	if err := json.NewDecoder(r.Body).Decode(&inc); err != nil {
		log.Info("failed to decode r.Body into inc", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Validate request
	if len(inc.Path) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		_, err := w.Write([]byte("Required param Path is missing or blank"))
		if err != nil {
			log.Info("failed to write error", err)
		}
		return
	}

	// Get userID
	cookie, err := r.Cookie("id")
	if err == http.ErrNoCookie {
		writeErrorInternal(w, err)
		return
	}
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	userID, err := strconv.ParseUint(cookie.Value, 10, 64)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	inc.userID = userID

	// Queue task to check plugin
	pool.SendWorkTimedAsync(30000, inc, func(_ interface{}, err error) {
		log.Info("worker returned")
		if err != nil {
			log.Info("worker failed", err)
		}
	})
	w.WriteHeader(http.StatusAccepted)
}

// handlerAPIPluginsDelete removes the plugin from the database if and only if
// the name is null. This ensures that any plugins that were ever available via
// search remain available (preventing a left-pad npm incident).
func handlerAPIPluginsDelete(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ABOT_ENV") != "test" {
		if !loggedIn(w, r) {
			return
		}
		if !csrf(w, r) {
			return
		}
	}

	// Get PluginID
	var req struct{ PluginID uint64 }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorBadRequest(w, err)
		return
	}
	if req.PluginID <= 0 {
		writeErrorBadRequest(w, errors.New("PluginID must be included and be greater than 0"))
		return
	}

	// Get userID
	cookie, err := r.Cookie("id")
	if err == http.ErrNoCookie {
		writeErrorInternal(w, err)
		return
	}
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	userID, err := strconv.ParseUint(cookie.Value, 10, 64)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}

	q := `DELETE FROM plugins WHERE id=$1 AND userid=$2 AND name IS NULL`
	_, err = db.Exec(q, req.PluginID, userID)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	log.Info("deleted plugin", req.PluginID)
	w.WriteHeader(http.StatusOK)
}

// handlerAPIWeatherSearch handles basic weather searching without requiring an
// API key for demo purposes.
func handlerAPIWeatherSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	city := ps.ByName("city")
	if len(city) == 0 {
		writeErrorBadRequest(w, errors.New("city param must be included"))
		return
	}
	var req struct {
		Weather []struct {
			Description string `json:"description"`
		} `json:"weather"`
		Main struct {
			Temp     float64 `json:"temp"`
			Humidity int     `json:"humidity"`
		}
	}
	log.Debug("searching for city", city)
	city = url.QueryEscape(city)
	res, err := http.Get(fmt.Sprintf("%s%s&appid=%s", apiWeatherURL, city,
		os.Getenv("OPEN_WEATHER_MAP_API_KEY")))
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	if err = json.NewDecoder(res.Body).Decode(&req); err != nil {
		writeErrorInternal(w, err)
		return
	}
	if err = res.Body.Close(); err != nil {
		writeErrorInternal(w, err)
		return
	}
	desc := []string{}
	for _, w := range req.Weather {
		desc = append(desc, w.Description)
	}
	resp := struct {
		Description []string
		Temp        float64
		Humidity    int
	}{
		Description: desc,
		Temp:        req.Main.Temp,
		Humidity:    req.Main.Humidity,
	}
	byt, err := json.Marshal(resp)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	if _, err = w.Write(byt); err != nil {
		log.Info("failed to write bytes", byt)
	}
}

// handlerAPIUserProfile fetches data for display on the user profile page.
func handlerAPIUserProfile(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ITSABOT_ENV") != "test" {
		if !loggedIn(w, r) {
			return
		}
	}
	cookie, err := r.Cookie("id")
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	var plugins []struct {
		ID            uint64
		Name          sql.NullString
		Path          string
		Description   sql.NullString
		DownloadCount uint64
		CompileOK     bool
		VetOK         bool
		TestOK        bool
		Error         sql.NullString
		UpdatedAt     time.Time
	}
	q := `SELECT id, name, path, description, downloadcount, compileok,
		vetok, testok, error, updatedat
	      FROM plugins WHERE userid=$1`
	if err = db.Select(&plugins, q, cookie.Value); err != nil {
		writeErrorInternal(w, err)
		return
	}
	byt, err := json.Marshal(plugins)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	_, err = w.Write(byt)
	if err != nil {
		log.Info("failed to write bytes", err)
		return
	}
}

// handlerAPIUserLoginSubmit logs in the user by creating a new access token.
func handlerAPIUserLoginSubmit(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string
		Password string
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorInternal(w, err)
		return
	}
	var u struct {
		ID       uint64
		Email    string
		Password []byte
	}
	q := `SELECT id, email, password FROM users WHERE email=$1`
	err := db.Get(&u, q, req.Email)
	if err == sql.ErrNoRows {
		writeErrorAuth(w, errors.New("Invalid email or password"))
		return
	}
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	err = bcrypt.CompareHashAndPassword(u.Password, []byte(req.Password))
	if err == bcrypt.ErrMismatchedHashAndPassword || err == bcrypt.ErrHashTooShort {
		writeErrorAuth(w, errors.New("Invalid email/password combination"))
		return
	} else if err != nil {
		writeErrorInternal(w, err)
		return
	}
	csrfToken, err := createCSRFToken(u.ID)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	header, token, err := getAuthToken(u.ID, req.Email)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	resp := struct {
		ID        uint64
		Email     string
		Scopes    []string
		AuthToken string
		IssuedAt  int64
		CSRFToken string
	}{
		ID:        u.ID,
		Email:     req.Email,
		Scopes:    header.Scopes,
		AuthToken: token,
		IssuedAt:  header.IssuedAt,
		CSRFToken: csrfToken,
	}
	byt, err := json.Marshal(resp)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	q = `INSERT INTO sessions (token, userid)
	     VALUES ($1, $2)`
	if _, err = db.Exec(q, resp.AuthToken, u.ID); err != nil {
		writeErrorInternal(w, err)
		return
	}
	if _, err = w.Write(byt); err != nil {
		log.Info("failed to write resp to http.ResponseWriter", err)
	}
}

// handlerAPIUserCreate creates a new user and a first access token.
func handlerAPIUserCreate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string
		Password string
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Info("failed to scan r.Body into req", err)
		writeErrorInternal(w, err)
		return
	}
	pass, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	var id uint64
	q := `INSERT INTO users (email, password) VALUES ($1, $2)
	      RETURNING id`
	if err = db.QueryRow(q, req.Email, pass).Scan(&id); err != nil {
		log.Info("failed to insert user into DB", err)
		writeErrorInternal(w, err)
		return
	}
	csrfToken, err := createCSRFToken(id)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	header, token, err := getAuthToken(id, req.Email)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	resp := struct {
		ID        uint64
		Email     string
		Scopes    []string
		AuthToken string
		IssuedAt  int64
		CSRFToken string
	}{
		ID:        id,
		Email:     req.Email,
		Scopes:    header.Scopes,
		AuthToken: token,
		IssuedAt:  header.IssuedAt,
		CSRFToken: csrfToken,
	}
	byt, err := json.Marshal(resp)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	q = `INSERT INTO sessions (token, userid)
	     VALUES ($1, $2)`
	if _, err = db.Exec(q, resp.AuthToken, id); err != nil {
		writeErrorInternal(w, err)
		return
	}
	if _, err = w.Write(byt); err != nil {
		log.Info("failed to write resp to http.ResponseWriter", err)
	}
}

// handlerAPIUserExpireTokens expires all tokens for a given user ID. Requires
// a token to be sent.
func handlerAPIUserExpireTokens(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ITSABOT_ENV") != "test" {
		if !loggedIn(w, r) {
			return
		}
	}
	cookie, err := r.Cookie("id")
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	uid, err := strconv.ParseUint(cookie.Value, 10, 64)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	q := `DELETE FROM sessions WHERE userid=$1`
	if _, err = db.Exec(q, uid); err != nil {
		writeErrorInternal(w, err)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// jsonError builds a simple JSON message from an error type in the format of
// { "Msg": err.Error() }
func jsonError(err error) error {
	tmp := strings.Replace(err.Error(), `"`, "'", -1)
	return errors.New(`{"Msg":"` + tmp + `"}`)
}

func connectDB() (*sqlx.DB, error) {
	var db *sqlx.DB
	var err error
	if os.Getenv("ITSABOT_ENV") == "production" {
		db, err = sqlx.Connect("postgres", os.Getenv("ITSABOT_DATABASE_URL"))
	} else {
		db, err = sqlx.Connect("postgres",
			"user=postgres dbname=itsabot sslmode=disable")
	}
	if err != nil {
		log.Debug(err)
	}
	return db, err
}

// This is based on a StackOverflow answer here:
// http://stackoverflow.com/a/31832326
func generateToken(n int) string {
	b := make([]byte, n)
	// A rand.Int63() generates 63 random bits, enough for letterIdxMax
	// characters
	for i, cache, remain := n-1, rand.Int63(), letterIdxMax; i >= 0; {
		if remain == 0 {
			cache, remain = rand.Int63(), letterIdxMax
		}
		if idx := int(cache & letterIdxMask); idx < len(letterBytes) {
			b[i] = letterBytes[idx]
			i--
		}
		cache >>= letterIdxBits
		remain--
	}
	return string(b)
}

func writeErr(w http.ResponseWriter, msg string) {
	if _, err := w.Write([]byte(msg)); err != nil {
		log.Info("failed to write error", err)
	}
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
	cookie, err := r.Cookie("id")
	if err == http.ErrNoCookie {
		writeErrorAuth(w, err)
		return false
	}
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	uid := cookie.Value
	cookie, err = r.Cookie("csrfToken")
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
	cookie, err := r.Cookie("issuedAt")
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
	cookie, err = r.Cookie("scopes")
	if err == http.ErrNoCookie {
		writeErrorAuth(w, err)
		return false
	}
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	scopes := strings.Fields(cookie.Value)
	cookie, err = r.Cookie("id")
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
	cookie, err = r.Cookie("email")
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
		Scopes:   scopes,
		IssuedAt: issuedAt,
	}
	byt, err := json.Marshal(a)
	if err != nil {
		writeErrorInternal(w, err)
		return false
	}
	known := hmac.New(sha512.New, []byte(os.Getenv("ABOT_SECRET")))
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

// createCSRFToken creates a new token, invalidating any existing token.
func createCSRFToken(uid uint64) (token string, err error) {
	q := `INSERT INTO csrfs (token, userid)
	      VALUES ($1, $2)
	      ON CONFLICT (userid) DO UPDATE SET token=$1`
	token = generateToken(securityTokenLength)
	if _, err := db.Exec(q, token, uid); err != nil {
		return "", err
	}
	return token, nil
}

// getAuthToken returns a token used for future client authorization with a CSRF
// token.
func getAuthToken(uid uint64, email string) (header *Header, authToken string,
	err error) {

	scopes := []string{}
	header = &Header{
		ID:       uid,
		Email:    email,
		Scopes:   scopes,
		IssuedAt: time.Now().Unix(),
	}
	byt, err := json.Marshal(header)
	if err != nil {
		return nil, "", err
	}
	hash := hmac.New(sha512.New, []byte(os.Getenv("ABOT_SECRET")))
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
