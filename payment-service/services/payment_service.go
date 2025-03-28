package services

import (
	"context"
	"errors"
	"time"

	"github.com/namphan2599/food-server/payment-service/models"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/paymentintent"
	"github.com/stripe/stripe-go/v72/refund"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type PaymentService struct {
	collection *mongo.Collection
}

func NewPaymentService(db *mongo.Database) *PaymentService {
	return &PaymentService{
		collection: db.Collection("payments"),
	}
}

func (s *PaymentService) CreatePaymentIntent(ctx context.Context, dto *models.CreatePaymentDTO) (*models.PaymentIntentDTO, error) {
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(int64(dto.Amount * 100)), // Convert to cents
		Currency: stripe.String("usd"),
		Metadata: map[string]string{
			"orderId": string(dto.OrderID),
			"userId":  string(dto.UserID),
		},
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		return nil, err
	}

	payment := &models.Payment{
		OrderID:         dto.OrderID,
		UserID:          dto.UserID,
		Amount:          dto.Amount,
		Method:          dto.Method,
		Status:          models.PaymentStatusPending,
		PaymentIntentID: pi.ID,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	_, err = s.collection.InsertOne(ctx, payment)
	if err != nil {
		return nil, err
	}

	return &models.PaymentIntentDTO{
		ClientSecret:    pi.ClientSecret,
		PaymentIntentID: pi.ID,
	}, nil
}

func (s *PaymentService) ConfirmPayment(ctx context.Context, paymentIntentID string) (*models.PaymentResponseDTO, error) {
	pi, err := paymentintent.Get(paymentIntentID, nil)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"paymentIntentId": paymentIntentID}
	update := bson.M{
		"$set": bson.M{
			"status":    models.PaymentStatusCompleted,
			"updatedAt": time.Now(),
		},
	}

	var payment models.Payment
	err = s.collection.FindOneAndUpdate(ctx, filter, update).Decode(&payment)
	if err != nil {
		return nil, err
	}

	return s.toPaymentResponseDTO(&payment), nil
}

func (s *PaymentService) RefundPayment(ctx context.Context, id string, dto *models.RefundPaymentDTO) (*models.PaymentResponseDTO, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var payment models.Payment
	err = s.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&payment)
	if err != nil {
		return nil, err
	}

	params := &stripe.RefundParams{
		PaymentIntent: stripe.String(payment.PaymentIntentID),
		Amount:       stripe.Int64(int64(dto.Amount * 100)),
	}
	if dto.Reason != "" {
		params.Reason = stripe.String(dto.Reason)
	}

	_, err = refund.New(params)
	if err != nil {
		return nil, err
	}

	update := bson.M{
		"$set": bson.M{
			"status":    models.PaymentStatusRefunded,
			"updatedAt": time.Now(),
		},
	}

	err = s.collection.FindOneAndUpdate(ctx, bson.M{"_id": objectID}, update).Decode(&payment)
	if err != nil {
		return nil, err
	}

	return s.toPaymentResponseDTO(&payment), nil
}

func (s *PaymentService) GetPaymentByOrderID(ctx context.Context, orderID int64) (*models.PaymentResponseDTO, error) {
	var payment models.Payment
	err := s.collection.FindOne(ctx, bson.M{"orderId": orderID}).Decode(&payment)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("payment not found")
		}
		return nil, err
	}

	return s.toPaymentResponseDTO(&payment), nil
}

func (s *PaymentService) GetPaymentByID(ctx context.Context, id string) (*models.PaymentResponseDTO, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var payment models.Payment
	err = s.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&payment)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("payment not found")
		}
		return nil, err
	}

	return s.toPaymentResponseDTO(&payment), nil
}

func (s *PaymentService) GetPaymentsByUserID(ctx context.Context, userID int64) ([]*models.PaymentResponseDTO, error) {
	cursor, err := s.collection.Find(ctx, bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var payments []models.Payment
	if err = cursor.All(ctx, &payments); err != nil {
		return nil, err
	}

	var response []*models.PaymentResponseDTO
	for _, payment := range payments {
		payment := payment
		response = append(response, s.toPaymentResponseDTO(&payment))
	}

	return response, nil
}

func (s *PaymentService) toPaymentResponseDTO(payment *models.Payment) *models.PaymentResponseDTO {
	return &models.PaymentResponseDTO{
		ID:              payment.ID.Hex(),
		OrderID:         payment.OrderID,
		UserID:          payment.UserID,
		Amount:          payment.Amount,
		Method:          payment.Method,
		Status:          payment.Status,
		PaymentIntentID: payment.PaymentIntentID,
		CreatedAt:       payment.CreatedAt,
		UpdatedAt:       payment.UpdatedAt,
	}
}
