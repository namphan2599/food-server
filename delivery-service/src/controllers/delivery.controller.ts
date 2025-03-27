import { Request, Response } from 'express';
import Delivery, { DeliveryStatus, IDelivery } from '../models/delivery.model';
import DeliveryPartner from '../models/deliveryPartner.model';
import mongoose from 'mongoose';

export const createDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      orderId, 
      restaurantId, 
      deliveryPartnerId, 
      userId, 
      pickupAddress, 
      deliveryAddress, 
      deliveryInstructions 
    } = req.body;
    
    // Check if delivery partner exists
    const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);
    if (!deliveryPartner) {
      res.status(404).json({ message: 'Delivery partner not found' });
      return;
    }
    
    // Check if delivery already exists for this order
    const existingDelivery = await Delivery.findOne({ orderId });
    if (existingDelivery) {
      res.status(400).json({ message: 'Delivery already exists for this order' });
      return;
    }
    
    // Create new delivery
    const delivery = new Delivery({
      orderId,
      restaurantId,
      deliveryPartnerId,
      userId,
      pickupAddress,
      deliveryAddress,
      deliveryInstructions,
      status: DeliveryStatus.ASSIGNED,
      assignedAt: new Date()
    });
    
    await delivery.save();
    
    // Update delivery partner's availability
    deliveryPartner.isAvailable = false;
    await deliveryPartner.save();
    
    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Error creating delivery', error });
  }
};

export const getDeliveryByOrderId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    
    const delivery = await Delivery.findOne({ orderId: parseInt(orderId) })
      .populate('deliveryPartnerId', '-password');
    
    if (!delivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }
    
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery', error });
  }
};

export const getDeliveryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const delivery = await Delivery.findById(id)
      .populate('deliveryPartnerId', '-password');
    
    if (!delivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }
    
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery', error });
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;
    
    const delivery = await Delivery.findById(id);
    
    if (!delivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }
    
    // Check if the delivery partner is the one assigned to this delivery
    if (delivery.deliveryPartnerId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to update this delivery' });
      return;
    }
    
    // Update status and related timestamps
    delivery.status = status;
    
    if (status === DeliveryStatus.PICKED_UP) {
      delivery.pickedUpAt = new Date();
    } else if (status === DeliveryStatus.DELIVERED) {
      delivery.deliveredAt = new Date();
      delivery.actualDeliveryTime = new Date();
      
      // Update delivery partner's stats
      const deliveryPartner = await DeliveryPartner.findById(req.user.id);
      if (deliveryPartner) {
        deliveryPartner.isAvailable = true;
        deliveryPartner.totalDeliveries += 1;
        await deliveryPartner.save();
      }
    } else if (status === DeliveryStatus.FAILED) {
      const { failureReason } = req.body;
      delivery.failureReason = failureReason;
      
      // Update delivery partner's availability
      const deliveryPartner = await DeliveryPartner.findById(req.user.id);
      if (deliveryPartner) {
        deliveryPartner.isAvailable = true;
        await deliveryPartner.save();
      }
    }
    
    await delivery.save();
    
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Error updating delivery status', error });
  }
};

export const rateDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    
    const delivery = await Delivery.findById(id);
    
    if (!delivery) {
      res.status(404).json({ message: 'Delivery not found' });
      return;
    }
    
    // Update delivery with rating and feedback
    delivery.customerRating = rating;
    delivery.customerFeedback = feedback;
    await delivery.save();
    
    // Update delivery partner's rating
    const deliveryPartner = await DeliveryPartner.findById(delivery.deliveryPartnerId);
    if (deliveryPartner) {
      // Calculate new average rating
      const totalRatings = deliveryPartner.totalDeliveries;
      const currentRatingTotal = deliveryPartner.rating * (totalRatings - 1);
      const newRating = (currentRatingTotal + rating) / totalRatings;
      
      deliveryPartner.rating = newRating;
      await deliveryPartner.save();
    }
    
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Error rating delivery', error });
  }
};

export const getDeliveriesByPartnerId = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const deliveries = await Delivery.find({ deliveryPartnerId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deliveries', error });
  }
};

export const getActiveDeliveryByPartnerId = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const delivery = await Delivery.findOne({ 
      deliveryPartnerId: req.user.id,
      status: { $in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT] }
    });
    
    if (!delivery) {
      res.status(404).json({ message: 'No active delivery found' });
      return;
    }
    
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active delivery', error });
  }
};