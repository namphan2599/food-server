import { Router } from 'express';
import * as DeliveryController from '../controllers/delivery.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Create delivery (called by Order service)
router.post('/', DeliveryController.createDelivery);

// Get delivery by order ID (public)
router.get('/order/:orderId', DeliveryController.getDeliveryByOrderId);

// Get delivery by ID
router.get('/:id', DeliveryController.getDeliveryById);

// Update delivery status (delivery partner only)
router.put('/:id/status', authenticateJWT, DeliveryController.updateDeliveryStatus);

// Rate delivery (customer)
router.put('/:id/rate', DeliveryController.rateDelivery);

// Get deliveries by partner ID (delivery partner only)
router.get('/partner/all', authenticateJWT, DeliveryController.getDeliveriesByPartnerId);

// Get active delivery for partner (delivery partner only)
router.get('/partner/active', authenticateJWT, DeliveryController.getActiveDeliveryByPartnerId);

export default router;