package main

import (
	"bytes"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
	"text/template"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo"
	mw "github.com/labstack/echo/middleware"
	_ "github.com/lib/pq"
)

var tmplLayout *template.Template
var db *sqlx.DB

const apiURL = "https://api.github.com/"

func main() {
	var err error
	tmplLayout, err = template.ParseFiles("assets/html/layout.html")
	if err != nil {
		log.Fatalln(err)
	}
	db, err = connectDB()
	if err != nil {
		log.Fatalln(err)
	}
	e := echo.New()
	e.Use(mw.Logger(), mw.Gzip(), mw.Recover())
	e.SetDebug(os.Getenv("ABOT_ENV") != "production")
	e.Static("/public/css", "public/css")
	e.Static("/public/js", "public/js")
	e.Static("/public/images", "assets/images")
	e.Get("/*", handlerIndex)
	e.Get("/api/search.json", handlerAPIPackagesSearch)
	e.Post("/api/packages.json", handlerAPIPackagesCreate)
	e.Run(":" + os.Getenv("ABOT_PORT"))
}

func handlerIndex(c *echo.Context) error {
	if os.Getenv("ABOT_ENV") != "production" {
		var err error
		tmplLayout, err = template.ParseFiles("assets/html/layout.html")
		if err != nil {
			log.Fatalln(err)
		}
	}
	var s []byte
	b := bytes.NewBuffer(s)
	if err := tmplLayout.Execute(b, nil); err != nil {
		log.Println(err)
		return err
	}
	if err := c.HTML(http.StatusOK, string(b.Bytes())); err != nil {
		log.Println(err)
		return err
	}
	return nil
}

func handlerAPIPackagesSearch(c *echo.Context) error {
	term := c.Query("q")
	if len(term) < 3 {
		return nil
	}
	var res []struct {
		ID            uint64
		Name          string
		Username      string
		Description   *string
		Readme        *string
		DownloadCount uint64
		Similarity    float64 `db:"sml"`
	}
	q := `SELECT id, name, username, description, readme, downloadcount, similarity((
		SELECT concat(name, username, description, readme)
		FROM packages AS ft
		WHERE id=packages.id), $1
	      ) AS sml
	      FROM packages
	      ORDER BY sml DESC, downloadcount DESC
	      LIMIT 10`
	if err := db.Select(&res, q, term); err != nil {
		return jsonError(err)
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
	if err := c.JSON(http.StatusOK, res); err != nil {
		return jsonError(err)
	}
	return nil
}

func handlerAPIPackagesCreate(c *echo.Context) error {
	var inc struct {
		Path string
	}
	if err := c.Bind(&inc); err != nil {
		return jsonError(err)
	}
	base, reponame := path.Split(inc.Path)
	if len(base) == 0 {
		return jsonError(errors.New("Invalid Github repo URL"))
	}
	ext := path.Ext(reponame)
	if len(ext) > 0 {
		reponame = reponame[:len(reponame)-len(ext)]
	}
	_, username := path.Split(base[:len(base)-1])

	// Ensure we don't spam Github with requests in line with their API
	// limit. Only fetch package updates once per day.
	q := `SELECT createdat, updatedat FROM packages WHERE name=$1`
	var times struct {
		CreatedAt *time.Time
		UpdatedAt *time.Time
	}
	err := db.Get(&times, q, inc.Path)
	if err != nil && err != sql.ErrNoRows {
		return jsonError(err)
	}
	oldUpdate := times.UpdatedAt.Before(time.Now().Add(-24 * time.Hour))
	var desc string
	var readme []byte
	if times.CreatedAt.Equal(*times.UpdatedAt) || oldUpdate {
		desc, readme, err = fetchFromGithub(username, reponame)
		if err != nil {
			return jsonError(err)
		}
	}

	// Insert the results into the DB
	q = `INSERT INTO packages (name, username, description, readme, downloadcount)
	     VALUES ($1, $2, $3, $4, 1)
	     ON CONFLICT (name) DO UPDATE SET
		description=$3,
		readme=$4,
		downloadcount=packages.downloadcount+1,
		updatedat=CURRENT_TIMESTAMP`
	_, err = db.Exec(q, inc.Path, username, desc, readme)
	if err != nil {
		return jsonError(err)
	}
	return nil
}

func fetchFromGithub(username, reponame string) (desc string, readme []byte,
	err error) {

	// Get repo description
	p1 := apiURL + path.Join("repos", username, reponame)
	resp, err := http.Get(p1)
	if err != nil {
		return desc, readme, err
	}
	defer resp.Body.Close()
	if resp.StatusCode == 404 {
		return desc, readme, errors.New("Invalid Github repo URL")
	}
	var respJSON struct {
		Description *string
	}
	if err = json.NewDecoder(resp.Body).Decode(&respJSON); err != nil {
		return desc, readme, err
	}
	desc = *respJSON.Description

	// Get README in markdown format for searching
	client := &http.Client{}
	p2 := apiURL + path.Join("repos", username, reponame, "readme")
	req, err := http.NewRequest("GET", p2, nil)
	if err != nil {
		return desc, readme, err
	}
	req.Header.Add("X-GitHub-Media-Type", "application/vnd.github.v3.raw")
	resp, err = client.Do(req)
	if err != nil {
		return desc, readme, err
	}
	defer resp.Body.Close()
	var respReadmeJSON struct {
		Content string
	}
	if resp.StatusCode != 404 {
		err = json.NewDecoder(resp.Body).Decode(&respReadmeJSON)
		if err != nil {
			return desc, readme, err
		}
		readme, err = base64.StdEncoding.DecodeString(
			respReadmeJSON.Content)
		if err != nil {
			return desc, readme, err
		}
	}
	return desc, readme, nil
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
		log.Println(err)
	}
	return db, err
}
