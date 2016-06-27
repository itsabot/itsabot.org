package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/itsabot/abot/core/log"
	"github.com/itsabot/abot/shared/datatypes"
	"github.com/itsabot/itsabot.org/socket"
	"github.com/jeffail/tunny"
)

var pool *tunny.WorkPool

// processPlugin tests a plugin for compatibility with Abot and its APIs,
// determining if the plugin should be published.
//
// TODO split this into smaller, easily understood functions.
func processPlugin(object interface{}) interface{} {
	var errored bool
	var p string
	var fi *os.File
	var fileInfo os.FileInfo
	var pluginJSON struct {
		Name        *string
		Description *string
		Icon        *string
		Maintainer  *string
		Settings    map[string]struct{}
		Usage       dt.StringSlice
	}
	inc := object.(struct {
		Path   string
		Secret string
		userID uint64
	})

	// Set up channels to retrieve a websocket connection when it's made.
	// If no connection is made within 15 seconds, this function still runs
	// but the user is not notified of progress.
	ws := getWSAtomic(inc.Secret)

	// Remove any extensions like .git
	inc.Path = strings.TrimSuffix(inc.Path, filepath.Ext(inc.Path))

	// Ensure inc.Path can't go 'up' directories
	writeLineToSocket(ws, &socket.Msg{
		Content: "> Validating " + inc.Path + "...",
	})
	if strings.Contains(inc.Path, "..") {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] plugin path cannot contain \"..\"",
			Color:   "red",
		})
		return fmt.Errorf("user %d attempted to move up dir.\n",
			inc.userID)
	}
	writeLineToSocket(ws, &socket.Msg{
		Content: "OK",
		Color:   "green",
	})

	// go get URL
	writeLineToSocket(ws, &socket.Msg{
		Content: "> Fetching " + inc.Path + "...",
	})
	outC, err := exec.
		Command("/bin/sh", "-c", "go get "+inc.Path).
		CombinedOutput()
	if err == nil {
		writeLineToSocket(ws, &socket.Msg{
			Content: "OK",
			Color:   "green",
		})
	} else if err.Error() == "exit status 1" {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] Failed to compile plugin",
			Color:   "red",
		})
		writeBytesToSocket(ws, outC, "red")
		goto savePlugin
	} else {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] Failed to compile plugin",
			Color:   "red",
		})
		writeBytesToSocket(ws, outC, "red")
		goto savePlugin
	}

	// At the end of this request, delete plugin from server to preserve
	// space
	p = filepath.Join(os.Getenv("GOPATH"), "src", inc.Path)
	defer func() {
		if os.Getenv("ITSABOT_ENV") != "production" {
			return
		}
		outC, err = exec.
			Command("/bin/sh", "-c", "rm -r "+p).
			CombinedOutput()
		if err != nil {
			// TODO email an admin to take a look at this
			log.Info("failed to rm", p)
		}
	}()

	// Extract plugin.json
	writeLineToSocket(ws, &socket.Msg{
		Content: "> Checking plugin.json...",
	})
	fi, err = os.Open(filepath.Join(p, "plugin.json"))
	if err == nil {
		writeLineToSocket(ws, &socket.Msg{
			Content: "OK",
			Color:   "green",
		})
	} else {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] Missing plugin.json",
		})
		writeLineToSocket(ws, &socket.Msg{
			Content: err.Error(),
			Color:   "red",
		})
	}
	defer func() {
		if err = fi.Close(); err != nil {
			log.Info("failed to close file", fi.Name())
		}
	}()
	fileInfo, err = fi.Stat()
	if err != nil {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] Failed to get file stats",
			Color:   "red",
		})
		writeLineToSocket(ws, &socket.Msg{
			Content: err.Error(),
			Color:   "red",
		})
		goto savePlugin
	}
	if fileInfo.Size() > 4096 {
		errored = true
		msg := fmt.Sprintf(
			"[ERR] plugin.json exceeds max size (4kb). It was %d bytes",
			fileInfo.Size())
		writeLineToSocket(ws, &socket.Msg{
			Content: msg,
			Color:   "red",
		})
		goto savePlugin
	}
	if err = json.NewDecoder(fi).Decode(&pluginJSON); err != nil {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] plugin.json format is invalid. please see the spec:",
			Color:   "red",
		})
		writeLineToSocket(ws, &socket.Msg{
			Content: "https://github.com/itsabot/abot/wiki/plugin.json-Spec",
			Color:   "red",
		})
	}

	// Validate the plugin's Name, Maintainer, and Description
	if pluginJSON.Name == nil || len(*pluginJSON.Name) == 0 {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] plugin.json must have a Name",
			Color:   "red",
		})
	}
	if pluginJSON.Name != nil && len(*pluginJSON.Name) > 255 {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] plugin.json's Name is too long. The max length is 255 characters",
			Color:   "red",
		})
	}
	if pluginJSON.Maintainer == nil && len(*pluginJSON.Maintainer) == 0 {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] plugin.json must have a Maintainer",
			Color:   "red",
		})
	}
	if pluginJSON.Maintainer != nil && len(*pluginJSON.Maintainer) > 255 {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] plugin.json's Maintainer is too long. The max length is 255 characters",
			Color:   "red",
		})
	}
	if pluginJSON.Description != nil && len(*pluginJSON.Description) > 512 {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] plugin.json's Description is too long. The max length is 512 characters",
			Color:   "red",
		})
	}
	// TODO Ensure the plugin's maintainer matches the submitting user
	// TODO confirm the plugin uses the Settings API instead of
	// os.Getenv.

	/*
		// TODO Run untrusted code from `go test` in a containerized
		// VM.
		writeLineToSocket(ws, &socket.Msg{
			Content: "> Running go test -short...",
		})
		outC, err = exec.
			Command("/bin/sh", "-c", "go test -short "+inc.Path).
			CombinedOutput()
		if err == nil {
			writeLineToSocket(ws, &socket.Msg{
				Content: "OK",
				Color:   "green",
			})
		} else if err.Error() != "exit status 2" {
			errored = true
			writeLineToSocket(ws, &socket.Msg{
				Content: "[ERR] go test failed",
				Color:   "red",
			})
			writeBytesToSocket(ws, outC, "red")
			writeLineToSocket(ws, &socket.Msg{
				Content: "Hint: if your test depends on an external API, make a short version of it that stubs the API call.",
				Color:   "red",
			})
		}
	*/
	writeLineToSocket(ws, &socket.Msg{
		Content: "> Running go vet...",
	})
	outC, err = exec.
		Command("/bin/sh", "-c", "go vet "+inc.Path).
		CombinedOutput()
	if err == nil {
		writeLineToSocket(ws, &socket.Msg{
			Content: "OK",
			Color:   "green",
		})
	} else {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] go vet failed",
			Color:   "red",
		})
		writeBytesToSocket(ws, outC, "red")
	}

savePlugin:
	// Save the plugin to the database
	writeLineToSocket(ws, &socket.Msg{
		Content: "> Saving and updating plugin...",
	})
	q := `INSERT INTO plugins (name, description, downloadcount, path,
		userid, abotversion, icon, settings, usage)
	      VALUES ($1, $2, 1, $3, $4, 0.2, $5, $6, $7)
	      ON CONFLICT (name) DO UPDATE SET
		description=$2,
		downloadcount=plugins.downloadcount+1,
		updatedat=CURRENT_TIMESTAMP,
		abotversion=0.2,
		icon=$5,
		settings=$6,
		usage=$7
	       RETURNING id`
	settings := dt.StringSlice{}
	for k := range pluginJSON.Settings {
		settings = append(settings, k)
	}
	if pluginJSON.Usage == nil {
		pluginJSON.Usage = dt.StringSlice{}
	}
	var id string
	row := db.QueryRow(q, pluginJSON.Name, pluginJSON.Description,
		inc.Path, inc.userID, pluginJSON.Icon, settings,
		pluginJSON.Usage)
	err = row.Scan(&id)
	if err == nil {
		writeLineToSocket(ws, &socket.Msg{
			Content: "OK",
			Color:   "green",
		})
		wsConns.pmu.Lock()
		wsConns.plugins[inc.Secret] = id
		wsConns.pmu.Unlock()
	} else {
		errored = true
		writeLineToSocket(ws, &socket.Msg{
			Content: "[ERR] Failed to save plugin to database",
			Color:   "red",
		})
		writeBytesToSocket(ws, []byte(err.Error()), "red")
	}

	if errored {
		writeLineToSocket(ws, &socket.Msg{
			Content: "============ FAILED to publish plugin =============",
			Color:   "red",
		})
		writeLineToSocket(ws, &socket.Msg{
			Content: "Correct the errors above and retry.",
			Color:   "red",
		})
		writeLineToSocket(ws, &socket.Msg{
			Type: socket.MsgTypeFinishedFailed,
		})
	} else {
		writeLineToSocket(ws, &socket.Msg{
			Content: "============ SUCCESS =============",
			Color:   "green",
		})
		writeLineToSocket(ws, &socket.Msg{
			Content: "Congratulations! We've published your plugin.",
			Color:   "green",
		})
		msg := fmt.Sprintf("View your plugin at %s/plugins/%s",
			os.Getenv("ITSABOT_URL"), id)
		writeLineToSocket(ws, &socket.Msg{
			Content: msg,
			Color:   "green",
		})
		writeLineToSocket(ws, &socket.Msg{
			Type:    socket.MsgTypeFinishedSuccess,
			Content: id,
		})
	}

	// If ws == nil, the socket was closed during this process. Should we
	// even handle this case before returning?
	return nil
}
