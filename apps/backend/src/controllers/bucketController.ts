import { Request, Response } from 'express';
import bucketService from '../services/bucketService';

export class BucketsController {
  async getBuckets(req: Request, res: Response) {
    try {
      const buckets = await bucketService.getBuckets();
      res.json(buckets);
    } catch (error) {
      console.error('Error fetching buckets:', error);
      res.status(500).json({ error: 'Failed to fetch buckets' });
    }
  }

  async getMeasurements(req: Request, res: Response) {
    try {
      const { bucketName } = req.params;
      
      if (!bucketName) {
        return res.status(400).json({ error: 'Bucket name is required' });
      }

      const measurements = await bucketService.getMeasurements(bucketName);
      res.json({ measurements });
    } catch (error) {
      console.error(`Error fetching measurements for bucket "${req.params.bucketName}":`, error);
      res.status(500).json({ error: 'Failed to fetch measurements' });
    }
  }

  async getFields(req: Request, res: Response) {
    try {
      const { bucketName, measurement } = req.params;
      
      if (!bucketName) {
        return res.status(400).json({ error: 'Bucket name is required' });
      }

      if (!measurement) {
        return res.status(400).json({ error: 'Measurement name is required' });
      }

      const fields = await bucketService.getFields(bucketName, measurement);
      res.json({ fields });
    } catch (error) {
      console.error(`Error fetching fields for measurement "${req.params.measurement}" in bucket "${req.params.bucketName}":`, error);
      res.status(500).json({ error: 'Failed to fetch fields' });
    }
  }
}