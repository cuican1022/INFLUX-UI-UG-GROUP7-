# Flux Query JSON Structure

## Overview

The Flux Query JSON provides a structured way to build and manage the flux query builder. It consists of modular parts that can be combined to create complex queries. It uses the types defined in `frontend/src/types/flux.ts`. 

## Structure

```typescript
interface FluxQueryJSON {
  parts: FluxQueryPart[]
  rawQuery?: string // For manual editing support
}
```

## Query Parts

### Bucket Part
Specifies the InfluxDB bucket to query from.

```typescript
{
  type: 'bucket',
  bucket: {
    id: string,
    name: string
  }
}
```

**Generated Flux:** `from(bucket: "bucket_name")`

### Date Range Part
Defines the time range for the query.

```typescript
{
  type: 'dateRange',
  dateRange: {
    start: string,  // e.g., "-1h", "2023-01-01T00:00:00Z"
    stop?: string   // optional, e.g., "-1m"
  }
}
```

**Generated Flux:** `|> range(start: -1h, stop: now())`

### Filter Part
Filters data by measurement or field values.

```typescript
{
  type: 'filter',
  filter: {
    type: 'measurement' | 'field',
    value: string | string[]  // single value or array for multiple
  }
}
```

**Generated Flux:**
- Single: `|> filter(fn: (r) => r._measurement == "cpu")`
- Multiple: `|> filter(fn: (r) => r._field == "usage" or r._field == "idle")`

## Usage Examples

### Basic Query
```json
{
  "parts": [
    {
      "type": "bucket",
      "bucket": { "id": "my-bucket", "name": "my-bucket" }
    },
    {
      "type": "dateRange",
      "dateRange": { "start": "-1h" }
    }
  ]
}
```

**Generates:**
```flux
from(bucket: "my-bucket")
    |> range(start: -1h)
    |> yield(name: "result")
```

### Complex Query with Filters
```json
{
  "parts": [
    {
      "type": "bucket",
      "bucket": { "id": "system", "name": "system" }
    },
    {
      "type": "dateRange",
      "dateRange": { "start": "-24h", "stop": "now()" }
    },
    {
      "type": "filter",
      "filter": { "type": "measurement", "value": "cpu" }
    },
    {
      "type": "filter",
      "filter": { "type": "field", "value": ["usage_user", "usage_system"] }
    }
  ]
}
```

**Generates:**
```flux
from(bucket: "system")
    |> range(start: -24h, stop: now())
    |> filter(fn: (r) => r._measurement == "cpu")
    |> filter(fn: (r) => r._field == "usage_user" or r._field == "usage_system")
    |> yield(name: "result")
```

## Raw Query Support

For complex queries beyond the structured parts, use `rawQuery`:

```json
{
  "parts": [],
  "rawQuery": "from(bucket: \"my-bucket\") |> range(start: -1h) |> aggregateWindow(every: 5m, fn: mean)"
}
```

## Utility Functions

- `jsonToFlux(json)` - Converts JSON structure to Flux query string
- `fluxToJson(flux)` - Parses Flux query string back to JSON structure
- `createBucketPart(bucket)` - Creates a bucket part
- `createDateRangePart(dateRange)` - Creates a date range part
- `createFilterPart(filter)` - Creates a filter part
- `addPart(json, part)` - Adds a part to existing query
- `removePart(json, index)` - Removes a part by index

## Notes

- Parts are processed in the order they appear in the `parts` array
- The system automatically adds `yield(name: "result")` at the end
- Complex queries that can't be parsed fall back to raw query mode
- Field filters support both single values and arrays for multiple selections

## Future additions

- Please create a new createPartName() function for each new part to be added.