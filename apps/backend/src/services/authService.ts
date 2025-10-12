import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';
import influxDBService from './influxDBService';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'jwt-dev-secret';
  private readonly JWT_EXPIRES_IN = '1h';

  async authenticate(apiToken: string, organization: string): Promise<string> {
    if (!apiToken || apiToken.trim().length === 0) {
      throw new Error('Invalid API token');
    }

    if (!organization || organization.trim().length === 0) {
      throw new Error('Invalid organization name');
    }

    // Validate the InfluxDB API token by making a real API call (get buckets)
    await this.validateInfluxDBCredentials(apiToken, organization);

    // Generate JWT with the validated data
    const payload: JWTPayload = {
      apiToken: apiToken,
      organization: organization
    };

    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });

    return token;
  }

  private async validateInfluxDBCredentials(apiToken: string, organization: string): Promise<void> {
    try {
      await influxDBService.initialize(apiToken, organization);
    } catch (error) {
      throw new Error('InfluxDB validation failed');
    }
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
