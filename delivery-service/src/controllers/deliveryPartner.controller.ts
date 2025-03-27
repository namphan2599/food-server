import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import DeliveryPartner, { IDeliveryPartner } from '../models/deliveryPartner.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, vehicleType, vehicleNumber } = req.body;
    
    // Check if delivery partner already exists
    const existingPartner = await DeliveryPartner.findOne({ email });
    if (existingPartner) {
      res.status(400).json({ message: 'Delivery partner already exists' });
      return;
    }
    
    // Create new delivery partner
    const deliveryPartner = new DeliveryPartner({
      email,
      password,
      firstName,
      lastName,
      phone,
      vehicleType,
      vehicleNumber
    });
    
    await deliveryPartner.save();
    
    res.status(201).json({ message: 'Delivery partner registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering delivery partner', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Find delivery partner
    const deliveryPartner = await DeliveryPartner.findOne({ email });
    if (!deliveryPartner) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Verify password
    const isMatch = await deliveryPartner.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: deliveryPartner._id, email: deliveryPartner.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({ 
      token, 
      deliveryPartner: { 
        id: deliveryPartner._id, 
        email: deliveryPartner.email,
        firstName: deliveryPartner.firstName,
        lastName: deliveryPartner.lastName,
        isAvailable: deliveryPartner.isAvailable
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const deliveryPartner = await DeliveryPartner.findById(req.user.id).select('-password');
    
    if (!deliveryPartner) {
      res.status(404).json({ message: 'Delivery partner not found' });
      return;
    }
    
    res.status(200).json(deliveryPartner);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { firstName, lastName, phone, vehicleType, vehicleNumber } = req.body;
    
    const deliveryPartner = await DeliveryPartner.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, vehicleType, vehicleNumber },
      { new: true }
    ).select('-password');
    
    if (!deliveryPartner) {
      res.status(404).json({ message: 'Delivery partner not found' });
      return;
    }
    
    res.status(200).json(deliveryPartner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { isAvailable } = req.body;
    
    const deliveryPartner = await DeliveryPartner.findByIdAndUpdate(
      req.user.id,
      { isAvailable },
      { new: true }
    ).select('-password');
    
    if (!deliveryPartner) {
      res.status(404).json({ message: 'Delivery partner not found' });
      return;
    }
    
    res.status(200).json(deliveryPartner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability', error });
  }
};

export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { longitude, latitude } = req.body;
    
    const deliveryPartner = await DeliveryPartner.findByIdAndUpdate(
      req.user.id,
      { 
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      },
      { new: true }
    ).select('-password');
    
    if (!deliveryPartner) {
      res.status(404).json({ message: 'Delivery partner not found' });
      return;
    }
    
    res.status(200).json(deliveryPartner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating location', error });
  }
};

export const getNearbyDeliveryPartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query; // maxDistance in meters
    
    if (!longitude || !latitude) {
      res.status(400).json({ message: 'Longitude and latitude are required' });
      return;
    }
    
    const deliveryPartners = await DeliveryPartner.find({
      isAvailable: true,
      isVerified: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)]
          },
          $maxDistance: parseInt(maxDistance as string)
        }
      }
    }).select('-password');
    
    res.status(200).json(deliveryPartners);
  } catch (error) {
    res.status(500).json({ message: 'Error finding nearby delivery partners', error });
  }
};