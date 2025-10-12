import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginResponse } from '../types/auth';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    try {
      const { apiToken, organization } = req.body;

      if (!apiToken) {
        return res.status(400).json({ error: 'API token is required' });
      }

      if (!organization) {
        return res.status(400).json({ error: 'Organization name is required' });
      }

      const jwt = await this.authService.authenticate(apiToken, organization);
      
      const response: LoginResponse = {
        success: true, 
        token: jwt,
        message: 'Authentication successful'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ 
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  validateToken = async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          valid: false, 
          message: 'No token provided' 
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      try {
        const payload = this.authService.verifyToken(token);
        res.json({ 
          valid: true, 
          message: 'Token is valid',
          organization: payload.organization
        });
      } catch (error) {
        res.status(401).json({ 
          valid: false, 
          message: 'Token is invalid or expired' 
        });
      }
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({ 
        valid: false, 
        message: 'Internal server error' 
      });
    }
  };
}
