package main

import (
	"bytes"
	"log"
	"net/http"
	"os"
	"text/template"

	"github.com/labstack/echo"
	mw "github.com/labstack/echo/middleware"
)

var tmplLayout *template.Template

func main() {
	var err error
	tmplLayout, err = template.ParseFiles("assets/html/layout.html")
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
