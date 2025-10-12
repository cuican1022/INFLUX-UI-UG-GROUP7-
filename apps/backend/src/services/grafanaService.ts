export interface EnsureDatasourceParams {
  name: string;
  influxUrl: string; // e.g. http://influxdb:8086 (from Grafana's perspective)
  organization: string;
  defaultBucket?: string;
  token: string; // InfluxDB v2 token
}

export interface CreatedDashboard {
  uid: string;
  url: string; // relative grafana URL like /d/abc123/title
}

export class GrafanaService {
  private baseUrl: string;
  private apiToken?: string;
  private basicAuth?: string; // base64 encoded username:password

  constructor() {
    this.baseUrl = process.env.GRAFANA_URL!;
    const token = process.env.GRAFANA_API_TOKEN;
    const username = process.env.GRAFANA_USERNAME;
    const password = process.env.GRAFANA_PASSWORD;

    if (token && token.trim().length > 0) {
      this.apiToken = token;
    } else if (username && password) {
      this.basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    }
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, '');
  }

  /**
   * For now, we just use environment variables
   * In the future it would probably be a good idea to set up a frontend flow
   * to 'connect' Grafana or whatever (by passing in credentials)
   */
  private getAuthHeaders(): Record<string, string> {
    if (this.apiToken) {
      return { Authorization: `Bearer ${this.apiToken}` };
    }
    if (this.basicAuth) {
      return { Authorization: `Basic ${this.basicAuth}` };
    }
    throw new Error('Grafana authentication not configured. Set GRAFANA_API_TOKEN or GRAFANA_USERNAME/GRAFANA_PASSWORD.');
  }

  /**
   * Generic request method---HTTP handler
   * TResponse is a generic type parameter, if the type is known then specify it
   */
  private async request<TResponse = unknown>(path: string, init?: RequestInit): Promise<TResponse> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...(init?.headers as Record<string, string> | undefined),
    };

    const res = await fetch(url, { ...init, headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Grafana API error ${res.status} ${res.statusText} for ${path}: ${text}`);
    }
    
    return await res.json() as TResponse;
  }

  // ----- DATASOURCE MANAGEMENT -----
  async getDatasourceByName(name: string): Promise<any | null> {
    try {
      const response = await this.request(`/api/datasources/name/${encodeURIComponent(name)}`);
      return response;
    } catch (error) {
      // If datasource doesnt exist Grafana should return 404
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async getAllDatasources(): Promise<any[]> {
    try {
      const response = await this.request<any[]>('/api/datasources');
      return response || [];
    } catch (error) {
      console.error('Error fetching all datasources:', error);
      return [];
    }
  }

  async createInfluxV2Datasource(params: EnsureDatasourceParams): Promise<any> {
    const body = {
      name: params.name,
      type: 'influxdb',
      access: 'proxy',
      url: params.influxUrl,
      basicAuth: false,
      jsonData: {
        version: 'Flux',
        organization: params.organization,
        defaultBucket: params.defaultBucket || undefined,
        httpMode: 'POST',
      },
      secureJsonData: {
        token: params.token,
      },
    };

    return await this.request('/api/datasources', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * A datasource is how Grafana interacts with InfluxDB
   * Used to execute flux queries and retrieve data from InfluxDB instance
   */
  async getOrCreateInfluxV2Datasource(params: EnsureDatasourceParams): Promise<{ id: number; uid: string; name: string }> {
    try {
      const existing = await this.getDatasourceByName(params.name);
      if (existing && existing.id && existing.uid) {
        return { id: existing.id, uid: existing.uid, name: existing.name };
      }
    } catch (error) {
      throw error;
    }

    // Otherwise create new datasource
    try {
      const created = await this.createInfluxV2Datasource(params);
      return { id: created.id, uid: created.uid, name: created.name };
    } catch (error) {
      throw error;
    }
  }

  // ----- DASHBOARD CREATION WITH FLUX PANEL -----
  async createDashboardWithFlux(options: {
    title: string;
    fluxQuery: string;
    datasourceUid: string;
    panelTitle?: string;
  }): Promise<CreatedDashboard> {
    const panelId = 1;
    const dashboard = {
      title: options.title,
      uid: undefined as string | undefined, // let Grafana assign
      timezone: 'browser',
      schemaVersion: 38,
      version: 0,
      panels: [
        {
          id: panelId,
          title: options.panelTitle || 'Flux Panel',
          type: 'timeseries',
          datasource: {
            type: 'influxdb',
            uid: options.datasourceUid,
          },
          gridPos: { h: 10, w: 24, x: 0, y: 0 },
          targets: [
            {
              refId: 'A',
              query: options.fluxQuery,
              queryType: 'flux',
              datasource: { type: 'influxdb', uid: options.datasourceUid },
              resultFormat: 'time_series',
            },
          ],
          options: {},
          fieldConfig: { defaults: {}, overrides: [] },
        },
      ],
    };

    const payload = { dashboard, overwrite: true }; // overwrite to avoid duplicates during dev
    const response = await this.request<{ uid: string; url: string }>('/api/dashboards/db', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response || !response.uid || !response.url) {
      throw new Error('Unexpected Grafana response while creating dashboard');
    }

    return { uid: response.uid, url: response.url };
  }

  getAbsoluteUrl(relative: string): string {
    return `http://localhost:3006${relative.startsWith('/') ? '' : '/'}${relative}`;
  }
}

export default new GrafanaService();


