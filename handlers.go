package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"text/template"
	"time"

	"github.com/itsabot/abot/core/log"
	"github.com/itsabot/abot/shared/datatypes"
	"github.com/itsabot/itsabot.org/socket"
	"github.com/julienschmidt/httprouter"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/net/websocket"
)

type Token struct {
	Token     string
	CreatedAt time.Time
}

type Plugin struct {
	ID            uint64
	Name          *string
	Path          string
	Icon          sql.NullString
	Description   sql.NullString
	DownloadCount uint64
	Error         bool
	UpdatedAt     time.Time
}

func initRoutes() *httprouter.Router {
	router := httprouter.New()
	router.ServeFiles("/public/*filepath", http.Dir("public"))

	// Route base requests to the single page javascript app.
	router.HandlerFunc("GET", "/", handlerIndex)
	router.NotFound = http.HandlerFunc(handlerIndex)

	// User routes
	router.HandlerFunc("GET", "/api/user.json", hapiUserProfile)
	router.HandlerFunc("POST", "/api/users.json", hapiUserCreate)
	router.HandlerFunc("POST", "/api/users/verify.json", hapiUserVerify)
	router.HandlerFunc("POST", "/api/users/forgot_password.json", hapiUserForgotPassword)
	router.HandlerFunc("POST", "/api/users/reset_password.json", hapiUserResetPassword)
	router.HandlerFunc("DELETE", "/api/users.json", hapiUserExpireTokens)
	router.HandlerFunc("POST", "/api/users/login.json", hapiUserLoginSubmit)
	router.HandlerFunc("GET", "/api/users/auth_tokens.json", hapiAuthTokens)
	router.HandlerFunc("POST", "/api/users/auth_token.json", hapiAuthTokenGenerate)
	router.HandlerFunc("DELETE", "/api/users/auth_token.json", hapiAuthTokenDelete)

	// Plugin routes
	router.Handle("GET", "/api/plugins/by_name/:name", hapiPluginsByName)
	router.Handle("GET", "/api/plugins/search/:q", hapiPluginsSearch)
	router.HandlerFunc("GET", "/api/plugins/popular.json", hapiPluginsPopular)
	router.Handle("GET", "/api/plugins/browse/:page", hapiPluginsBrowse)
	router.Handle("GET", "/api/plugins/show/:id", hapiPluginsShow)
	router.HandlerFunc("POST", "/api/plugins.json", hapiPluginsCreate)
	router.HandlerFunc("PUT", "/api/plugins.json", hapiPluginsIncrementCount)
	router.HandlerFunc("DELETE", "/api/plugins.json", hapiPluginsDelete)
	router.Handle("GET", "/api/weather/:city", hapiWeatherSearch)
	router.Handler("GET", "/api/ws", websocket.Handler(hapiWebsocket))

	// Training routes
	router.Handle("GET", "/api/plugins/train/:id", hapiPluginsTrainings)
	router.HandlerFunc("POST", "/api/plugins/train.json", hapiPluginsTrain)
	router.HandlerFunc("PUT", "/api/plugins/train.json", hapiPluginsTrainUpdate)
	router.HandlerFunc("DELETE", "/api/plugins/train.json", hapiPluginsTrainDelete)
	router.Handle("POST", "/api/plugins/test_auth.json", hapiPluginsTestAuth)
	router.HandlerFunc("OPTIONS", "/api/plugins/train/:pluginName", hapiOptionsTrainings)
	router.HandlerFunc("OPTIONS", "/api/plugins/train.json", hapiOptionsTrain)
	router.HandlerFunc("OPTIONS", "/api/plugins/test_auth.json", hapiOptionsTrain)

	return router
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

func hapiOptionsTrainings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Access-Control-Allow-Origin")
	w.WriteHeader(http.StatusOK)
}

func hapiOptionsTrain(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "POST,PUT,DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Access-Control-Allow-Origin,X-Auth-Tokens,X-Auth-Plugin-ID")
	w.WriteHeader(http.StatusOK)
}

func hapiPluginsIncrementCount(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Path string
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorBadRequest(w, err)
		return
	}
	log.Info("recording download for plugin", req.Path)
	q := `UPDATE plugins SET downloadcount=plugins.downloadcount+1
	      WHERE path=$1`
	_, err := db.Exec(q, req.Path)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	w.WriteHeader(200)
}

func hapiPluginsPopular(w http.ResponseWriter, r *http.Request) {
	var res []struct {
		ID            uint64
		Name          string
		Path          string
		Icon          string
		Description   *string
		DownloadCount uint64
		UserID        uint64
		Error         bool
		Similarity    float64 `db:"sml"`
		Settings      *dt.StringSlice
		Usage         *dt.StringSlice
	}
	q := `SELECT id, name, path, description, downloadcount, userid, icon,
		error, settings, usage FROM plugins
	      WHERE name IS NOT NULL AND icon IS NOT NULL
	      ORDER BY downloadcount DESC
	      LIMIT 6`
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

func hapiPluginsBrowse(w http.ResponseWriter, r *http.Request,
	ps httprouter.Params) {

	tmp := ps.ByName("page")
	page, err := strconv.Atoi(tmp)
	if err != nil {
		page = 0
	}
	res := struct {
		Count   int
		Plugins []struct {
			ID          uint64
			Name        string
			Path        string
			Icon        *string
			Description *string
			AbotVersion *float64
		}
	}{}
	q := `SELECT id, name, path, icon, description, abotversion
	      FROM plugins
	      WHERE name IS NOT NULL
	      ORDER BY createdat DESC OFFSET $1 LIMIT 10`
	if err := db.Select(&res.Plugins, q, page*10); err != nil {
		writeErrorInternal(w, err)
		return
	}
	q = `SELECT COUNT(*) FROM plugins WHERE name IS NOT NULL`
	if err := db.Get(&res.Count, q); err != nil {
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

// hapiPluginsShow responds with information details about a specific plugin to
// display alongside install instructions.
func hapiPluginsShow(w http.ResponseWriter, r *http.Request,
	ps httprouter.Params) {

	var tmp struct {
		Name          string
		Path          string
		Description   sql.NullString
		Maintainer    sql.NullString
		Icon          sql.NullString
		DownloadCount uint64
		AbotVersion   float64
		Usage         *dt.StringSlice
		Settings      *dt.StringSlice
	}
	q := `SELECT name, path, description, maintainer, icon, downloadcount,
		abotversion, usage, settings
	      FROM plugins WHERE id=$1`
	if err := db.Get(&tmp, q, ps.ByName("id")); err != nil {
		writeErrorBadRequest(w, err)
		return
	}
	plugin := struct {
		Name          string
		Path          string
		Description   *string
		Maintainer    *string
		Icon          *string
		DownloadCount uint64
		AbotVersion   float64
		Usage         *dt.StringSlice
		Settings      *dt.StringSlice
	}{
		Name:          tmp.Name,
		Path:          tmp.Path,
		DownloadCount: tmp.DownloadCount,
		AbotVersion:   tmp.AbotVersion,
		Usage:         tmp.Usage,
		Settings:      tmp.Settings,
	}
	if tmp.Description.Valid {
		plugin.Description = &tmp.Description.String
	}
	if tmp.Maintainer.Valid {
		plugin.Maintainer = &tmp.Maintainer.String
	}
	if tmp.Icon.Valid {
		plugin.Icon = &tmp.Icon.String
	}
	byt, err := json.Marshal(plugin)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	_, err = w.Write(byt)
	if err != nil {
		log.Info("failed to write response.", err)
	}
}

// hapiPluginsByName enables an Abot to receive plugin IDs for installed
// plugins. Handling this on plugin install enables Abot to communicate with
// plugin IDs in all requests that follow, which dramatically improves DB
// performance.
func hapiPluginsByName(w http.ResponseWriter, r *http.Request,
	ps httprouter.Params) {

	plugin := ps.ByName("name")
	var resp struct{ ID uint64 }
	q := `SELECT id FROM plugins WHERE name=$1`
	if err := db.Get(&resp, q, plugin); err != nil {
		writeErrorInternal(w, err)
		return
	}
	byt, err := json.Marshal(resp)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	_, err = w.Write(byt)
	if err != nil {
		log.Info("failed to write response.", err)
	}
}

func hapiPluginsSearch(w http.ResponseWriter, r *http.Request,
	ps httprouter.Params) {

	term := ps.ByName("q")
	if len(term) < 3 {
		w.WriteHeader(200)
		return
	}
	var res []struct {
		ID            uint64
		Name          string
		Path          string
		Description   sql.NullString
		DownloadCount uint64
		UserID        uint64
		Similarity    float64 `db:"sml"`
	}
	q := `SELECT id, name, path, description, downloadcount, userid,
		similarity((
			SELECT concat(name, description)
			FROM plugins AS ft
			WHERE id=plugins.id), $1
		) AS sml
	      FROM plugins
	      WHERE name IS NOT NULL AND error IS FALSE
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

func hapiPluginsCreate(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ABOT_ENV") != "test" {
		if !loggedIn(w, r) {
			return
		}
	}
	var inc struct {
		Path   string
		Secret string

		// Important for security that this remains unexported
		userID uint64
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
	cookie, err := r.Cookie("iaID")
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
		if err != nil {
			log.Info("worker failed.", err)
		}
	})
	w.WriteHeader(http.StatusAccepted)
}

// hapiPluginsDelete removes the plugin from the database if and only if the
// name is null. This ensures that any plugins that were ever available via
// search remain available (preventing a left-pad npm incident).
func hapiPluginsDelete(w http.ResponseWriter, r *http.Request) {
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
	cookie, err := r.Cookie("iaID")
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

// hapiPluginsTrainings retrieves trained sentences and properties for a given
// plugin.
func hapiPluginsTrainings(w http.ResponseWriter, r *http.Request,
	ps httprouter.Params) {

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Access-Control-Allow-Origin")
	sentences := []struct {
		ID       uint64
		Sentence string
		Intent   *string
	}{}
	q := `SELECT id, sentence, intent FROM trainings
	      WHERE pluginid=$1
	      ORDER BY createdat DESC`
	err := db.Select(&sentences, q, ps.ByName("id"))
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	b, err := json.Marshal(sentences)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	_, err = w.Write(b)
	if err != nil {
		log.Info("failed to write response.", err)
	}
}

// hapiPluginsTrain trains a plugin on a new sentence or updates the intent of
// an existing sentence.
func hapiPluginsTrain(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Access-Control-Allow-Origin")
	pid, ok := authToken(w, r)
	if !ok {
		return
	}
	log.Info(pid, ok)
	var req struct {
		Sentence string
		Intent   string
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorBadRequest(w, err)
		return
	}
	if len(req.Intent) == 0 {
		writeErrorBadRequest(w, errors.New("Intent cannot be blank"))
		return
	}
	if len(req.Sentence) == 0 {
		writeErrorBadRequest(w, errors.New("Sentence cannot be blank"))
		return
	}

	q := `INSERT INTO trainings (sentence, intent, pluginid)
	      VALUES ($1, $2, $3)
	      ON CONFLICT (sentence, pluginid) DO UPDATE SET intent=$1
	      RETURNING id`
	var trainingID uint64
	err := db.QueryRow(q, req.Sentence, req.Intent, pid).Scan(&trainingID)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}

	resp := struct {
		ID       uint64
		Intent   string
		Sentence string
	}{
		ID:       trainingID,
		Intent:   req.Intent,
		Sentence: req.Sentence,
	}
	byt, err := json.Marshal(resp)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	_, err = w.Write(byt)
	if err != nil {
		log.Info("failed to write response.", err)
	}
}

// hapiPluginsTrainUpdate updates a plugin's training sentences.
func hapiPluginsTrainUpdate(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Access-Control-Allow-Origin")
	pid, ok := authToken(w, r)
	if !ok {
		return
	}
	var req []struct {
		ID     uint64
		Intent string
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorBadRequest(w, err)
		return
	}
	tx, err := db.Beginx()
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	var q string
	for _, s := range req {
		q = `UPDATE trainings SET intent=$1 WHERE id=$2 AND pluginid=$3`
		_, err = tx.Exec(q, s.Intent, s.ID, pid)
		if err != nil {
			writeErrorInternal(w, err)
			return
		}
	}
	if err = tx.Commit(); err != nil {
		writeErrorInternal(w, err)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// hapiPluginsTrainDelete deletes a trained sentence from a plugin.
func hapiPluginsTrainDelete(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Access-Control-Allow-Origin")
	pid, ok := authToken(w, r)
	if !ok {
		return
	}
	var req struct{ Sentence string }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorBadRequest(w, err)
		return
	}
	q := `DELETE FROM trainings WHERE pluginid=$1 AND sentence=$2`
	_, err := db.Exec(q, pid, req.Sentence)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// hapiPluginsTestAuth is a helper for testing remote Abot authentication when
// adding tokens. This handler returns the associated plugin ID for which
// training may be performed.
func hapiPluginsTestAuth(w http.ResponseWriter, r *http.Request,
	ps httprouter.Params) {

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Access-Control-Allow-Origin")
	var req struct{ Token string }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorBadRequest(w, err)
		return
	}
	var uid uint64
	q := `SELECT userid FROM authtokens WHERE token=$1`
	err := db.Get(&uid, q, req.Token)
	if err == sql.ErrNoRows {
		writeErrorBadRequest(w, errors.New("Invalid token. Are you sure you copied it correctly?"))
		return
	}
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	resp := []uint64{}
	q = `SELECT id FROM plugins WHERE userid=$1`
	if err = db.Select(&resp, q, uid); err != nil {
		writeErrorInternal(w, err)
		return
	}
	byt, err := json.Marshal(resp)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	_, err = w.Write(byt)
	if err != nil {
		log.Info("failed to write response.", err)
	}
}

// hapiWeatherSearch handles basic weather searching without requiring an API
// key for demo purposes.
func hapiWeatherSearch(w http.ResponseWriter, r *http.Request,
	ps httprouter.Params) {

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

// hapiUserProfile fetches data for display on the user profile page.
func hapiUserProfile(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ITSABOT_ENV") != "test" {
		if !loggedIn(w, r) {
			return
		}
	}
	cookie, err := r.Cookie("iaID")
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	var plugins []Plugin
	q := `SELECT id, name, path, description, downloadcount, error,
		updatedat
	      FROM plugins WHERE userid=$1`
	if err = db.Select(&plugins, q, cookie.Value); err != nil {
		writeErrorInternal(w, err)
		return
	}
	var tokens []Token
	q = `SELECT token, createdat FROM authtokens WHERE userid=$1
	     ORDER BY createdat DESC`
	if err = db.Select(&tokens, q, cookie.Value); err != nil {
		writeErrorInternal(w, err)
		return
	}
	resp := struct {
		Plugins []Plugin
		Tokens  []Token
	}{Plugins: plugins, Tokens: tokens}
	byt, err := json.Marshal(resp)
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

// hapiUserLoginSubmit logs in the user by creating a new access token.
func hapiUserLoginSubmit(w http.ResponseWriter, r *http.Request) {
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
		AuthToken string
		IssuedAt  int64
		CSRFToken string
	}{
		ID:        u.ID,
		Email:     req.Email,
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

// hapiAuthTokens returns all the auth tokens for a given user.
func hapiAuthTokens(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ITSABOT_ENV") != "test" {
		if !loggedIn(w, r) {
			return
		}
	}
	cookie, err := r.Cookie("iaID")
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	var tokens []string
	q := `SELECT token FROM authtokens WHERE userid=$1
	      ORDER BY createdat DESC`
	if err = db.Get(&tokens, q, cookie.Value); err != nil {
		writeErrorInternal(w, err)
		return
	}
	byt, err := json.Marshal(&tokens)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	_, err = w.Write(byt)
	if err != nil {
		log.Info("failed to write response.", err)
	}
}

// hapiAuthTokenGenerate an auth token for authenticating into external
// services.
func hapiAuthTokenGenerate(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ITSABOT_ENV") != "test" {
		if !loggedIn(w, r) {
			return
		}
	}
	token, err := generateToken(48)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	cookie, err := r.Cookie("iaID")
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	var t time.Time
	q := `INSERT INTO authtokens (token, userid) VALUES ($1, $2)
	      RETURNING createdat`
	err = db.QueryRow(q, token, cookie.Value).Scan(&t)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	res := struct {
		Token     string
		CreatedAt time.Time
	}{Token: token, CreatedAt: t}
	byt, err := json.Marshal(res)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	_, err = w.Write(byt)
	if err != nil {
		log.Info("failed to write response.", err)
	}
}

// hapiAuthTokenDelete deletes an auth token from the DB.
func hapiAuthTokenDelete(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ITSABOT_ENV") != "test" {
		if !loggedIn(w, r) {
			return
		}
	}
	var req struct{ Token string }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorBadRequest(w, err)
		return
	}
	q := `DELETE FROM authtokens WHERE token=$1`
	_, err := db.Exec(q, req.Token)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// hapiUserCreate creates a new user and a first access token.
func hapiUserCreate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string
		Email    string
		Password string
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Info("failed to scan r.Body into req", err)
		writeErrorInternal(w, err)
		return
	}
	code, err := generateToken(36)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	pass, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	tx, err := db.Begin()
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	var id uint64
	q := `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)
	      RETURNING id`
	err = tx.QueryRow(q, req.Name, req.Email, pass).Scan(&id)
	if err != nil {
		if err.Error() == `pq: duplicate key value violates unique constraint "users_email_key"` {
			writeErrorBadRequest(w, errors.New("That email has already been registered."))
			return
		}
		writeErrorInternal(w, err)
		return
	}
	q = `INSERT INTO verifications (userid, code) VALUES ($1, $2)`
	_, err = tx.Exec(q, id, code)
	if err != nil {
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
		AuthToken string
		IssuedAt  int64
		CSRFToken string
	}{
		ID:        id,
		Email:     req.Email,
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
	if _, err = tx.Exec(q, resp.AuthToken, id); err != nil {
		writeErrorInternal(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		writeErrorInternal(w, err)
		return
	}
	if _, err = w.Write(byt); err != nil {
		log.Info("failed to write resp to http.ResponseWriter", err)
	}
	sendVerificationEmail(req.Email, req.Name, code, id)
}

// hapiUserVerify verifies ownership over the user's email to enable
// publishing.
func hapiUserVerify(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ITSABOT_ENV") != "test" {
		if !loggedIn(w, r) {
			return
		}
	}
	var req struct{ Code string }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorBadRequest(w, err)
		return
	}
	tx, err := db.Beginx()
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	cookie, err := r.Cookie("iaID")
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	uid := cookie.Value
	q := `DELETE FROM verifications WHERE userid=$1 AND code=$2`
	res, err := tx.Exec(q, uid, req.Code)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	count, err := res.RowsAffected()
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	if count == 0 {
		writeErrorAuth(w, errors.New("Invalid code."))
		return
	}
	q = `UPDATE users SET verified=TRUE WHERE id=$1`
	_, err = tx.Exec(q, uid)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	var user struct {
		Name  *string
		Email string
	}
	q = `SELECT name, email FROM users WHERE id=$1`
	if err = tx.Get(&user, q, uid); err != nil {
		writeErrorInternal(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		writeErrorInternal(w, err)
		return
	}
	var name string
	if user.Name == nil {
		name = ""
	} else {
		name = *user.Name
	}
	sendWelcomeEmail(user.Email, name)
}

// hapiUserForgotPassword sends a "reset password" email to the user associated
// with the email. If the email doesn't exist, a success message will still be
// displayed to prevent users from determining which emails exist and which
// don't via this endpoint.
func hapiUserForgotPassword(w http.ResponseWriter, r *http.Request) {
	var email string
	if err := json.NewDecoder(r.Body).Decode(&email); err != nil {
		writeErrorBadRequest(w, err)
		return
	}
	var name sql.NullString
	q := `SELECT name FROM users WHERE email=$1`
	err := db.Get(&name, q, email)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusOK)
		return
	}
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	code, err := generateToken(36)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	q = `INSERT INTO passwordresets (email, code) VALUES ($1, $2)
	     ON CONFLICT (email) DO
		UPDATE SET code=$2, createdat=CURRENT_TIMESTAMP`
	_, err = db.Exec(q, email, code)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	if !name.Valid {
		name.String = ""
	}
	sendPasswordResetEmail(email, name.String, code)
}

// hapiUserResetPassword confirms a user's password reset code matches our
// expectations, then allows the user to reset the password.
func hapiUserResetPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code     string
		Email    string
		Password string
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErrorBadRequest(w, err)
		return
	}
	tx, err := db.Begin()
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	q := `DELETE FROM passwordresets WHERE code=$1 AND email=$2`
	res, err := tx.Exec(q, req.Code, req.Email)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	rows, err := res.RowsAffected()
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	if rows == 0 {
		writeErrorBadRequest(w, errors.New("That code has expired. Please request a new password reset."))
		return
	}
	pass, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	q = `UPDATE users SET password=$1 WHERE email=$2`
	_, err = tx.Exec(q, pass, req.Email)
	if err != nil {
		writeErrorInternal(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		writeErrorInternal(w, err)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// hapiUserExpireTokens expires all tokens for a given user ID. Requires a
// token to be sent.
func hapiUserExpireTokens(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("ITSABOT_ENV") != "test" {
		if !loggedIn(w, r) {
			return
		}
	}
	cookie, err := r.Cookie("iaID")
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
	q = `DELETE FROM csrfs WHERE userid=$1`
	if _, err = db.Exec(q, uid); err != nil {
		writeErrorInternal(w, err)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// hapiWebsocket opens a websocket connection with the server.
func hapiWebsocket(ws *websocket.Conn) {
	var key string
	if err := websocket.Message.Receive(ws, &key); err != nil {
		log.Info("failed to receive first data from websocket.", err)
		closeSocket(ws, key)
		return
	}
	wsConns.pmu.Lock()
	pid, exists := wsConns.plugins[key]
	wsConns.pmu.Unlock()
	if exists {
		// Notify the client that the plugin has already been published
		// and close the connection.
		err := websocket.JSON.Send(ws, socket.Msg{
			Type:    socket.MsgTypeFinishedSuccess,
			Content: pid,
		})
		if err != nil {
			log.Info("failed to send finished message.", err)
		}
		closeSocket(ws, key)
		return
	}
	wsConns.smu.Lock()
	wsConns.sockets[key] = ws
	wsConns.smu.Unlock()

	// Ignore the error value of receiving an empty message, since that
	// means we should close the socket
	var close struct{}
	_ = websocket.Message.Receive(ws, &close)
	closeSocket(ws, key)
}
