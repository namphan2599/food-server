package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "PENDING"
	PaymentStatusCompleted PaymentStatus = "COMPLETED"
	PaymentStatusFailed    PaymentStatus = "FAILED"
	PaymentStatusRefunded  PaymentStatus = "REFUNDED"
)

type Payment struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OrderID        int64             `bson:"orderId" json:"orderId"`
	UserID         int64             `bson:"userId" json:"userId"`
	Amount         float64           `bson:"amount" json:"amount"`
	Method         string            `bson:"method" json:"method"`
	Status         PaymentStatus     `bson:"status" json:"status"`
	PaymentIntentID string          `bson:"paymentIntentId" json:"paymentIntentId"`
	CreatedAt      time.Time        `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time        `bson:"updatedAt" json:"updatedAt"`
}

type CreatePaymentDTO struct {
	OrderID int64   `json:"orderId" binding:"required"`
	UserID  int64   `json:"userId" binding:"required"`
	Amount  float64 `json:"amount" binding:"required"`
	Method  string  `json:"method" binding:"required"`
}

type PaymentIntentDTO struct {
	ClientSecret    string `json:"clientSecret"`
	PaymentIntentID string `json:"paymentIntentId"`
}

type RefundPaymentDTO struct {
	Amount float64 `json:"amount" binding:"required"`
	Reason string  `json:"reason"`
}

type PaymentResponseDTO struct {
	ID             string        `json:"id"`
	OrderID        int64         `json:"orderId"`
	UserID         int64         `json:"userId"`
	Amount         float64       `json:"amount"`
	Method         string        `json:"method"`
	Status         PaymentStatus `json:"status"`
	PaymentIntentID string      `json:"paymentIntentId"`
	CreatedAt      time.Time    `json:"createdAt"`
	UpdatedAt      time.Time    `json:"updatedAt"`
}
