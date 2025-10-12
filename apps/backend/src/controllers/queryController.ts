import { Request, Response } from 'express';
import influxDBService from '../services/influxDBService';

export class QueryController {
  async analyzeFluxQuery(req: Request, res: Response) {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const analysis = await influxDBService.analyzeFluxQuery(query);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing Flux query:', error);
      res.status(500).json({ error: 'Failed to analyze Flux query' });
    }
  }
}
