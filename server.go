package main

import (
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"text/template"
	"time"

	"github.com/itsabot/abot/core/log"
	"github.com/jeffail/tunny"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq" // Import the postgres adapter
)

var tmplLayout *template.Template
var db *sqlx.DB

const apiURL = "https://api.github.com/"
const apiWeatherURL = "http://api.openweathermap.org/data/2.5/weather?units=imperial&q="
const securityTokenLength = 48
const bearerAuthKey = "Bearer"

func main() {
	var err error
	p := filepath.Join("assets", "html", "layout.html")
	tmplLayout, err = template.ParseFiles(p)
	if err != nil {
		log.Fatal(err)
	}
	log.SetDebug(os.Getenv("ITSABOT_DEBUG") == "true")
	db, err = connectDB()
	if err != nil {
		log.Fatal(err)
	}
	checkEnvVars()
	router := initRoutes()
	pool, err = tunny.CreatePool(runtime.NumCPU(), processPlugin).Open()
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if err = pool.Close(); err != nil {
			log.Info("failed to close worker pool", err)
		}
	}()
	go expirePasswordResetTokens(30 * time.Minute)

	log.Info("booted server")
	if len(os.Getenv("ITSABOT_PORT")) > 0 {
		err = http.ListenAndServe(":"+os.Getenv("ITSABOT_PORT"), router)
	} else {
		err = http.ListenAndServe(":"+os.Getenv("PORT"), router)
	}
	if err != nil {
		log.Fatal(err)
	}
}
