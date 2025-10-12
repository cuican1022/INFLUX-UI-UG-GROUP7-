# Authentication System

This file explains how auth works backend (currently only InfluxDB auth). 

## Overview

The authentication system uses a two-token approach:
1. **InfluxDB API Token**: User's actual InfluxDB credentials
2. **JWT Token**: Session token for the frontend application

**Why JWT Tokens?**
The client requires two things:

- Secure authentication
- Future proof usage of InfluxDB cloud services

JWT tokens provide a secure way to maintain user sessions without storing sensitive credentials on the frontend. Instead of repeatedly sending the InfluxDB API token (which could be intercepted), it's embedded securely within a JWT that:
- Expires automatically (1 hour)
- Can be verified server-side

## Auth Flow

```
1. User submits InfluxDB API token + InfluxDB Org. The org is required for using the InfluxDB client for direct queries
2. Backend validates token + org against InfluxDB API using influxdb-client-apis
3. If valid, backend generates JWT with API token + org embedded
4. Frontend stores JWT for subsequent requests
5. Backend can extract InfluxDB token/org from JWT for API calls
```

## How It Works

### Login Process (`POST /api/auth/login`)

**Request:**
```json
{
  "apiToken": "influx-admin-token-123",
  "organization": "adelaide-influx-ug7"
}
```

**Process:**
1. `AuthController.login()` receives the request
2. Calls `AuthService.authenticate(apiToken)`
3. Creates an InfluxDB API client (which can be reused)
4. Validates the credentials with the API client by fetching the available buckets
5. If valid, generates JWT with embedded API token
6. Returns JWT to frontend

**Response:**
```json
{
  "success": true,
  "token": "example-jwt-token",
  "message": "Authentication successful"
}
```

**Key Points:**
- `apiToken` and `organization` is embedded in JWT for later use
- `expiresIn: '1h'` sets 1-hour expiration

### 3. Token Validation

**Frontend Usage:**
- TODO: Store JWT in Pinia store
- Include in Authorization header for backend requests: `Bearer <jwt>`

**Backend Verification:**
- `AuthService.verifyToken(jwt)` decodes and validates JWT (not the Influx credentials itself - just the JWT)
- Extracts embedded `apiToken` for InfluxDB API calls
- Checks expiration automatically
