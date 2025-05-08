package client

import (
	"chat/room"

	"github.com/gorilla/websocket"
)

type client struct {
	socket websocket.Conn

	username string

	token string

	rooms map[string]*room.Room
}

/*
Join a room (2 people or more (2 exactly for now))
Leave a room ()
*/
