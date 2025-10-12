# API Client

A simple HTTP client for making API requests with TypeScript support and JWT authentication.

## Features

- **Simple HTTP methods**: GET, POST, PUT, DELETE
- **TypeScript generics** for type safety - this is like templating in C++
- **JWT Authentication support** - automatically adds Bearer tokens to requests
- **Handles both JSON parsing and errors**

## Configuration

Base API is set to `http://localhost:3000/api`. This means that when making requests with the client, you just pass in the direct route, e.g. ```/users```, ```/tables```.

You can use the alternative base url when making request to third party API's, such as the InfluxDB API.

## Authentication

The API client supports JWT authentication via Bearer tokens. Pass the token in the options parameter:

```typescript
const token = localStorage.getItem('authToken')
const data = await apiClient.get('/buckets', {
  token: token
});
```

For authenticated endpoints, the token will be automatically included in the `Authorization` header as `Bearer {token}`.

## Usage

### Basic GET Request
```typescript
import { apiClient } from '@/api/apiClient';
import { type Buckets } from '@influxdata/influxdb-client-apis';

const token = localStorage.getItem('authToken')
const buckets = await apiClient.get<Buckets>('/buckets', {
  token: token
});
```

### Alternative Base Url API Request - Useful for querying the InfluxDB API
```typescript
// Override base URL for external APIs
// This example is retrieving an auth from the local InfluxDB server
// It uses the VITE_INFLUXDB_URL that gets assigned in the docker compose file, and is 
// imported through the vite dev server (Vite only exposes env vars that start with VITE_)
// See: https://docs.influxdata.com/influxdb/v2/api/v2/#operation/GetAuthorizationsID
const user = await apiClient.get(`/authorizations/${authID}`, { 
  baseURL: import.meta.env.VITE_INFLUXDB_URL 
});
```

### POST Request
```typescript
const token = localStorage.getItem('authToken')
const newUser = await apiClient.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
}, {
  token: token
});
```

### PUT Request
```typescript
const token = localStorage.getItem('authToken')
const updatedUser = await apiClient.put<User>(`/users/${id}`, {
  name: 'Jane Doe'
}, {
  token: token
});
```

### DELETE Request
```typescript
const token = localStorage.getItem('authToken')
await apiClient.delete(`/users/${id}`, {
  token: token
});
```

## Error Handling

The client throws errors for non-OK responses. Use with try-catch:

```typescript
try {
  const data = await apiClient.get('/endpoint');
} catch (error) {
  // Handle error with functions in utils folder
  handleError('Request failed', error);
}
```

### Error Handling Pattern

The API client itself doesn't handle user-facing errors (like toasts). Instead, errors propagate up to the calling service layer where they can be handled appropriately.

**Example in a service:**
```typescript
// In bucketService.ts
async getBuckets(): Promise<Buckets> {
  try {
    const buckets = await apiClient.get<Buckets>('/buckets', {
      token: token
    })
    return buckets
  } catch (error) {
    // Service layer handles user-facing errors
    handleError('Error fetching buckets', error)
    throw error
  }
}
```