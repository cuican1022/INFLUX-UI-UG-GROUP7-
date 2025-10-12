import { InfluxDB, QueryApi, FluxTableMetaData, Row } from '@influxdata/influxdb-client';
import { BucketsAPI, QueryAPI } from '@influxdata/influxdb-client-apis';

export class InfluxDBService {
  private client: InfluxDB | null = null;
  private url: string;
  private organization: string | null = null;

  // ----- CLIENT MANAGEMENT -----
  constructor(url?: string) {
    this.url = url || process.env.INFLUXDB_URL || 'http://localhost:8086';
  }

  async initialize(token: string, organization: string): Promise<InfluxDB> {
    if (!token) {
      throw new Error('Token is required to initialize InfluxDB client');
    }

    if (!organization) {
      throw new Error('Organization is required to initialize InfluxDB client');
    }

    this.organization = organization;
    this.client = new InfluxDB({ url: this.url, token });

    try {
      const bucketsApi = new BucketsAPI(this.client);
      await bucketsApi.getBuckets();
    } catch (error) {
      // Reset client on failure
      this.client = null;
      this.organization = null;
      throw new Error('Failed to validate InfluxDB credentials. Please check your token and organization.');
    }
    
    return this.client;
  }

  getClient(): InfluxDB {
    if (!this.client) {
      throw new Error('InfluxDB client not initialized. Call initialize(token) first.');
    }
    return this.client;
  }

  isInitialized(): boolean {
    return this.client !== null;
  }

  getUrl(): string {
    return this.url;
  }

  setUrl(url: string): void {
    this.url = url;
    this.client = null;
  }

  // ----- FLUX QUERY OPERATIONS -----
  async executeFluxQuery(query: string): Promise<{ table: FluxTableMetaData; rows: Row[] }[]> {
    const client = this.getClient();
    if (!this.organization) {
      throw new Error('Organization not set. Call initialize() first.');
    }

    const queryApi: QueryApi = client.getQueryApi(this.organization);
    const results: { table: FluxTableMetaData; rows: Row[] }[] = [];

    try {
      for await (const row of queryApi.iterateRows(query)) {
        // Find existing table or create new one
        let tableIndex = results.findIndex(t => t.table === row.tableMeta);
        if (tableIndex === -1) {
          results.push({ table: row.tableMeta, rows: [] });
          tableIndex = results.length - 1;
        }
        results[tableIndex].rows.push(row);
      }
      return results;
    } catch (error) {
      throw error;
    }
  }

  async analyzeFluxQuery(query: string): Promise<{ errors?: Array<{ line?: number; column?: number; character?: number; message?: string; }> }> {
    const client = this.getClient();
    if (!this.organization) {
      throw new Error('Organization not set. Call initialize() first.');
    }

    const queryAPI = new QueryAPI(client);
    
    try {
      const response = await queryAPI.postQueryAnalyze({
        body: {
          query: query,
          type: 'flux'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new InfluxDBService();
