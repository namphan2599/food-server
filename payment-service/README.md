# Payment Service

A microservice for handling payments in the food delivery system. This service is implemented in Go using the Gin framework and integrates with Stripe for payment processing.

## Features

- Payment processing using Stripe
- MongoDB for storing payment records
- RESTful API endpoints for payment operations
- Secure payment handling with proper error management

## Prerequisites

- Go 1.21 or later
- MongoDB
- Stripe account and API keys

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your configuration:
   ```
   MONGO_URI=mongodb://localhost:27017
   STRIPE_SECRET_KEY=your_stripe_secret_key
   PORT=8080
   ```

3. Install dependencies:
   ```bash
   go mod download
   ```

4. Run the service:
   ```bash
   go run main.go
   ```

## API Endpoints

- `POST /api/payments/create-intent` - Create a new payment intent
- `POST /api/payments/confirm/:paymentIntentId` - Confirm a payment
- `PUT /api/payments/:id/refund` - Refund a payment
- `GET /api/payments/order/:orderId` - Get payment by order ID
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments/user/:userId` - Get payments by user ID

## Architecture

The service follows a clean architecture pattern with the following components:

- `handlers` - HTTP request handlers
- `services` - Business logic layer
- `models` - Data models and DTOs
- `config` - Configuration management

## Testing

To run tests:
```bash
go test ./...
```

## Docker Support

Build the Docker image:
```bash
docker build -t payment-service .
```

Run the container:
```bash
docker run -p 8080:8080 --env-file .env payment-service
```
