import { Buckets, BucketsAPI } from '@influxdata/influxdb-client-apis';
import influxDBService from './influxDBService';

export class BucketService {
  async getBuckets(): Promise<Buckets> {
    try {
      const client = influxDBService.getClient();
      const bucketsApi = new BucketsAPI(client);
      return await bucketsApi.getBuckets();
    } catch (error) {
      throw new Error(`Failed to fetch buckets: ${error}`);
    }
  }

  async getMeasurements(bucketName: string): Promise<string[]> {
    // Use a flux query to get all measurements
    const query = `from(bucket: "${bucketName}")
                    |> range(start: -10y)
                    |> keep(columns: ["_measurement"])
                    |> distinct()`;

    try {
      const results = await influxDBService.executeFluxQuery(query);
      const measurements: string[] = [];

      // Extract measurement names from the results
      for (const { rows } of results) {
        for (const row of rows) {
          if (row.values && row.values.length > 0) {
            // _measurement column index
            const measurementIndex = row.tableMeta.columns?.findIndex(col => col.label === '_measurement');
            if (measurementIndex !== undefined && measurementIndex >= 0 && row.values[measurementIndex]) {
              measurements.push(row.values[measurementIndex]);
            }
          }
        }
      }

      return measurements;
    } catch (error) {
      throw new Error(`Failed to fetch measurements for bucket "${bucketName}": ${error}`);
    }
  }

  async getFields(bucketName: string, measurement: string): Promise<string[]> {
    // Use a flux query to get all fields from a specific measurement
    const query = `from(bucket: "${bucketName}")
                    |> range(start: -10y)
                    |> filter(fn: (r) => r._measurement == "${measurement}")
                    |> keep(columns: ["_field"])
                    |> distinct()`;

    try {
      const results = await influxDBService.executeFluxQuery(query);
      const fields: string[] = [];

      // Extract field names from the results
      for (const { rows } of results) {
        for (const row of rows) {
          if (row.values && row.values.length > 0) {
            // _field column index
            const fieldIndex = row.tableMeta.columns?.findIndex(col => col.label === '_field');
            if (fieldIndex !== undefined && fieldIndex >= 0 && row.values[fieldIndex]) {
              fields.push(row.values[fieldIndex]);
            }
          }
        }
      }

      return fields;
    } catch (error) {
      throw new Error(`Failed to fetch fields for measurement "${measurement}" in bucket "${bucketName}": ${error}`);
    }
  }
}

export default new BucketService();
