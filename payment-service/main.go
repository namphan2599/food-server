package main

import (
	"context"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/namphan2599/food-server/payment-service/config"
	"github.com/namphan2599/food-server/payment-service/handlers"
	"github.com/namphan2599/food-server/payment-service/services"
	"github.com/stripe/stripe-go/v72"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Cannot load config:", err)
	}

	// Set Stripe API key
	stripe.Key = cfg.StripeSecretKey

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatal("Cannot connect to MongoDB:", err)
	}
	defer client.Disconnect(ctx)

	db := client.Database("payment_service")

	// Initialize services and handlers
	paymentService := services.NewPaymentService(db)
	paymentHandler := handlers.NewPaymentHandler(paymentService)

	// Setup Gin router
	router := gin.Default()

	// Payment routes
	api := router.Group("/api/payments")
	{
		api.POST("/create-intent", paymentHandler.CreatePaymentIntent)
		api.POST("/confirm/:paymentIntentId", paymentHandler.ConfirmPayment)
		api.PUT("/:id/refund", paymentHandler.RefundPayment)
		api.GET("/order/:orderId", paymentHandler.GetPaymentByOrderID)
		api.GET("/:id", paymentHandler.GetPaymentByID)
		api.GET("/user/:userId", paymentHandler.GetPaymentsByUserID)
	}

	// Start server
	port := cfg.Port
	if port == "" {
		port = "8080"
	}
	
	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
