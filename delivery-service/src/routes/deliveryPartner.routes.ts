import { Router } from 'express';
import * as DeliveryPartnerController from '../controllers/deliveryPartner.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', DeliveryPartnerController.register);
router.post('/login', DeliveryPartnerController.login);

// Protected routes
router.get('/profile', authenticateJWT, DeliveryPartnerController.getProfile);
router.put('/profile', authenticateJWT, DeliveryPartnerController.updateProfile);
router.put('/availability', authenticateJWT, DeliveryPartnerController.updateAvailability);
router.put('/location', authenticateJWT, DeliveryPartnerController.updateLocation);

// Admin/Restaurant routes
router.get('/nearby', DeliveryPartnerController.getNearbyDeliveryPartners);

export default router;