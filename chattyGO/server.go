package main

import (
	"encoding/json"

	"log"
	"sync"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

var registeredClients = make(map[string]*client)
var clientsMutex sync.Mutex

type msg struct {
	Time             string `json:"time"`
	TypeMsg          string `json:"typeMsg"`
	Sender_username  string `json:"sender"`
	Receiver_username string `json:"receiver"`
	Payload          string `json:"payload"`
}

type Friends struct {
	Friends []string `json:"friends"`
}

type client struct {
	socket *websocket.Conn
	mu     sync.Mutex
	lastActive time.Time
}

func (c *client) listenAndforward() {
	defer func() {
		if r := recover(); r != nil {
			log.Println("Recovered from panic in listenAndforward:", r)
		}
	}()

	// Keep track of activity
	c.lastActive = time.Now()

	for {
		_, message, err := c.socket.ReadMessage()
		if err != nil {
			log.Println("Error reading message:", err)
			break
		}

		// Update last active time
		c.lastActive = time.Now()

		var castedMsg msg
		err = json.Unmarshal(message, &castedMsg)
		if err != nil {
			log.Println("Error unmarshalling message:", err)
			continue
		}

		log.Printf("Received message: %+v", castedMsg)

		if castedMsg.TypeMsg == "logout" {
			log.Printf("User %s logging out", castedMsg.Sender_username)
			clientsMutex.Lock()
			delete(registeredClients, castedMsg.Sender_username)
			clientsMutex.Unlock()
			c.socket.Close()
			return
		}

		// Forward message to receiver
		clientsMutex.Lock()
		receiverClient, exists := registeredClients[castedMsg.Receiver_username]
		clientsMutex.Unlock()

		if exists && receiverClient != nil {
			receiverClient.mu.Lock()
			if receiverClient.socket != nil {
				err = receiverClient.socket.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Println("Error writing message to receiver:", err)
				} else {
					log.Printf("Message forwarded to %s", castedMsg.Receiver_username)
				}
			}
			receiverClient.mu.Unlock()
		} else {
			log.Printf("Receiver %s not found or offline", castedMsg.Receiver_username)
		}
	}

	// Clean up when the client disconnects
	clientsMutex.Lock()
	for username, cl := range registeredClients {
		if cl != nil && cl.socket == c.socket {
			log.Printf("Removing disconnected client: %s", username)
			delete(registeredClients, username)
			break
		}
	}
	clientsMutex.Unlock()

	c.socket.Close()
}

// A simple heartbeat to check client connections
func startHeartbeat() {
	ticker := time.NewTicker(30 * time.Second)
	go func() {
		for range ticker.C {
			clientsMutex.Lock()
			now := time.Now()
			for username, cl := range registeredClients {
				// Check if client has been inactive for more than 2 minutes
				if cl != nil && now.Sub(cl.lastActive) > 2*time.Minute {
					log.Printf("Client %s timed out due to inactivity", username)
					delete(registeredClients, username)
					if cl.socket != nil {
						cl.socket.Close()
					}
				}
			}
			clientsMutex.Unlock()
		}
	}()
}

func Server() {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			log.Printf("Error: %v, Code: %d", err, code)
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Add middleware
	app.Use(cors.New())
	app.Use(logger.New())

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("Server is healthy")
	})

	// User validation endpoint
	app.Get("/user-validation", func(c *fiber.Ctx) error {
		username := c.Query("username")
		if username == "" {
			return fiber.NewError(fiber.StatusBadRequest, "Username is required")
		}

		log.Println("Validating username:", username)

		clientsMutex.Lock()
		_, exists := registeredClients[username]
		clientsMutex.Unlock()

		if exists {
			log.Println(username, "is already used!")
			return c.SendStatus(fiber.StatusFound)
		}

		log.Println("Accepted:", username)
		return c.SendStatus(fiber.StatusOK)
	})

	// Websocket middleware and route
	app.Use("/registered-user", func(c *fiber.Ctx) error {
		username := c.Query("username")
		if username == "" {
			return fiber.NewError(fiber.StatusBadRequest, "Username is required")
		}

		// For WebSocket upgrade
		if websocket.IsWebSocketUpgrade(c) {
			clientsMutex.Lock()
			_, exists := registeredClients[username]
			clientsMutex.Unlock()

			if exists {
				// User already registered with an active connection
				log.Printf("Rejected WebSocket connection for %s: Already connected", username)
				return fiber.NewError(fiber.StatusConflict, "User already connected")
			}

			c.Locals("username", username)
			return c.Next()
		}

		return fiber.ErrUpgradeRequired
	})

	app.Get("/registered-user", websocket.New(func(c *websocket.Conn) {
		username := c.Locals("username").(string)
		log.Println("WebSocket client connected:", username)

		clientMutex := sync.Mutex{}
		newClient := &client{
			socket: c,
			mu:     clientMutex,
			lastActive: time.Now(),
		}

		clientsMutex.Lock()
		registeredClients[username] = newClient
		clientsMutex.Unlock()

		newClient.listenAndforward()
		log.Println("WebSocket client disconnected:", username)
	}))

	// Get online friends endpoint
	app.Get("/existing-friends", func(c *fiber.Ctx) error {
		username := c.Query("username")
		if username == "" {
			return fiber.NewError(fiber.StatusBadRequest, "Username is required")
		}

		log.Println(username, "looking for friends")

		clientsMutex.Lock()
		_, userExists := registeredClients[username]
		if !userExists {
			clientsMutex.Unlock()
			return fiber.NewError(fiber.StatusForbidden, "User not registered")
		}

		friends := []string{}
		for friendUsername, client := range registeredClients {
			if friendUsername != username && client != nil && client.socket != nil {
				friends = append(friends, friendUsername)
			}
		}
		clientsMutex.Unlock()

		response := Friends{
			Friends: friends,
		}

		return c.JSON(response)
	})

	// Start heartbeat check
	startHeartbeat()

	// Start server
	log.Println("Server starting on port 8080")
	log.Fatal(app.Listen(":8080"))
}
