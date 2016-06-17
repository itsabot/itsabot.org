// Package socket exports socket datatypes for shared use across itsabot and
// abot.
package socket

// MsgType covers the various types of websocket message signals that may be
// sent.
type MsgType string

// Msg is a websocket message used in displaying progress to developer when
// publishing a plugin.
type Msg struct {
	Type    MsgType
	Content string
	Color   string
}

// The various types of message signals that may be sent.
const (
	MsgTypeFinishedSuccess MsgType = "success"
	MsgTypeFinishedFailed  MsgType = "failed"
)
