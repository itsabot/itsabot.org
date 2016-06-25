package main

import (
	"bufio"
	"bytes"
	"sync"
	"time"

	"github.com/itsabot/abot/core/log"
	"github.com/itsabot/itsabot.org/socket"
	"golang.org/x/net/websocket"
)

var wsConns = websocketSet{
	sockets: map[string]*websocket.Conn{},
	smu:     &sync.Mutex{},

	plugins: map[string]string{},
	pmu:     &sync.Mutex{},
}

type websocketSet struct {
	// sockets relates a "secret" id string shared by client/server to a
	// specific websocket connection
	sockets map[string]*websocket.Conn
	smu     *sync.Mutex

	// plugins relates that same secret id to a specific plugin ID that's
	// been published. This enables a user to "refresh" the plugin
	// processing page and be redirected to the correct location. The
	// plugin ID is kept as a string for convenience, removing the need for
	// uint64->string conversions.
	plugins map[string]string
	pmu     *sync.Mutex
}

// getWSAtomic retrieves a websocket atomically, or nil if no websocket
// connection is established after 15 seconds.
func getWSAtomic(id string) *websocket.Conn {
	wsConns.smu.Lock()
	ws := wsConns.sockets[id]
	wsConns.smu.Unlock()
	if ws != nil {
		return ws
	}
	var count int
	tck := time.NewTicker(500 * time.Millisecond)
	for {
		<-tck.C
		wsConns.smu.Lock()
		ws = wsConns.sockets[id]
		wsConns.smu.Unlock()
		if ws != nil {
			tck.Stop()
			break
		}
		count++

		// If 15 seconds have elapsed, give up
		if count > 30 {
			tck.Stop()
			break
		}
	}
	return ws
}

// writeLineToSocket writes bytes to a socket if that socket exists line by
// line. If messages fail to send, close the socket and make its memory
// available again.
func writeLineToSocket(ws *websocket.Conn, line *socket.Msg) {
	if ws == nil {
		return
	}
	if err := websocket.JSON.Send(ws, line); err != nil {
		log.Info("failed to send to websocket. closing.", err)
		if err = ws.Close(); err != nil {
			log.Info("failed to close websocket.", err)
			ws = nil
			return
		}
		ws = nil
	}
}

// writeBytesToSocket writes individual lines one-by-one, adding proper classes
// to indent the nested code. This function is pretty specific to its use-case
// in displaying progress to the user when publishing plugins.
func writeBytesToSocket(ws *websocket.Conn, outC []byte, color string) {
	if ws == nil {
		return
	}
	scn := bufio.NewScanner(bytes.NewBuffer(outC))
	for scn.Scan() {
		line := scn.Text()
		if len(line) == 0 {
			continue
		}
		class := " pad"
		if line[0] == '\t' {
			class += "-deep"
		}
		writeLineToSocket(ws, &socket.Msg{
			Content: line,
			Color:   color + class,
		})
	}
	err := scn.Err()
	if err != nil {
		log.Info("failed to scan command output.", err)
	}
}

// closeSocket and nil out its memory with its identifier.
func closeSocket(ws *websocket.Conn, key string) {
	if err := ws.Close(); err != nil {
		log.Info("failed to close websocket.", err)
	}
	wsConns.smu.Lock()
	wsConns.sockets[key] = nil
	wsConns.smu.Unlock()
}
