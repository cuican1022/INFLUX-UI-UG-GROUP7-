import { Request, Response } from 'express';
import grafanaService from '../services/grafanaService';
import { AuthService } from '../services/authService';

export class GrafanaController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  createDashboard = async (req: Request, res: Response) => {
    try {
      const { fluxQuery, title, panelTitle } = req.body;

      if (!fluxQuery) {
        return res.status(400).json({ error: 'Flux query is required' });
      }

      if (!title) {
        return res.status(400).json({ error: 'Dashboard title is required' });
      }

      // Get auth info from JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const token = authHeader.substring(7);
      const payload = this.authService.verifyToken(token);

      // Ensure InfluxDB datasource exists in Grafana
      const datasource = await grafanaService.getOrCreateInfluxV2Datasource({
        name: 'InfluxDB-v2',
        influxUrl: process.env.INFLUXDB_URL || 'http://influxdb:8086',
        organization: payload.organization,
        defaultBucket: 'influx-bucket',
        token: payload.apiToken
      });

      // Create dashboard with Flux query
      const dashboard = await grafanaService.createDashboardWithFlux({
        title,
        fluxQuery,
        datasourceUid: datasource.uid,
        panelTitle: panelTitle || 'Flux Query Result'
      });

      // Return dashboard info with absolute URL
      const absoluteUrl = grafanaService.getAbsoluteUrl(dashboard.url);

      res.json({
        success: true,
        dashboard: {
          uid: dashboard.uid,
          url: dashboard.url,
          absoluteUrl: absoluteUrl
        },
        message: 'Dashboard created successfully'
      });

    } catch (error) {
      console.error('Error creating Grafana dashboard:', error);
      res.status(500).json({ 
        error: 'Failed to create dashboard',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getDatasources = async (req: Request, res: Response) => {
    try {
      const datasources = await grafanaService.getAllDatasources();
      res.json({ 
        message: 'Datasources retrieved successfully',
        datasources: datasources.map(ds => ({
          id: ds.id,
          uid: ds.uid,
          name: ds.name,
          type: ds.type
        }))
      });
    } catch (error) {
      console.error('Error fetching datasources:', error);
      res.status(500).json({ error: 'Failed to fetch datasources' });
    }
  };
}
