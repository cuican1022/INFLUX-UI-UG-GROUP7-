# InfluxDB Integration

## Overview

The backend integrates with InfluxDB using the official `@influxdata/influxdb-client` and `@influxdata/influxdb-client-apis` packages to fetch buckets and execute Flux queries. It makes use of the types that the packages provide to filter the data. You can see the types for yourself with intellisense as long as your IDE supports it (VScode etc).

## Key Components

### InfluxDBService (`influxDBService.ts`)
Central service managing the InfluxDB client connection and query execution.

**Key Methods:**
- `initialize(token, organization)` - Sets up authenticated client
- `executeFluxQuery(query)` - Executes Flux queries and returns structured results
- `getClient()` - Returns the initialized InfluxDB client

### BucketService (`bucketService.ts`)
High-level service for bucket operations using InfluxDBService.

**Methods:**
- `getBuckets()` - Fetches all buckets using BucketsAPI
- `getMeasurements(bucketName)` - Uses Flux query to get unique measurements

## Flux Query Execution

The `executeFluxQuery` function is the core of our InfluxDB integration:

```typescript
async executeFluxQuery(query: string): Promise<{ table: FluxTableMetaData; rows: Row[] }[]>
```

**Process:**
1. Gets authenticated QueryApi client
2. Iterates through query results row by row
3. Groups rows by table metadata
4. Returns structured array of tables with their rows

**Example Usage:**
```typescript
const query = `from(bucket: "my-bucket")
                |> range(start: -10y)
                |> keep(columns: ["_measurement"])
                |> distinct()`;

const results = await influxDBService.executeFluxQuery(query);
```

## Authentication Flow

1. User provides InfluxDB API token + organization
2. Backend validates credentials by fetching buckets
3. JWT token generated with embedded InfluxDB credentials
4. Subsequent requests use JWT to extract InfluxDB token for API calls

## Data Flow Example

**Fetching Measurements:**
1. Frontend calls `/buckets/{bucketName}/measurements`
2. Backend extracts InfluxDB token from JWT
3. BucketService executes Flux query via InfluxDBService
4. Results parsed and returned as string array
5. Frontend displays measurements in UI
