import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { JWTPayload } from '../types/auth';
import influxDBService from '../services/influxDBService';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const authService = new AuthService();
    const decoded = authService.verifyToken(token);
    
    // Re init InfluxDB client if not already so
    if (!influxDBService.isInitialized()) {
      await influxDBService.initialize(decoded.apiToken, decoded.organization);
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
