# Backend Server

Backend API server for InfluxDB UI application using Express (typescript)

## Architecture Overview

The backend follows this pattern (similar to MVC):

```
Request -> Routes -> Controllers -> Services -> External APIs/Database
Response <- Controllers <- Services <- External APIs/Database
```

InfluxDB api requests will be proxied through the backend, using the Node InfluxDB clients that are provided in the npm packages: ```@influxdata/influxdb-client``` (used for direct queries) & ```@influxdata/influxdb-client-apis``` (used for management queries). This is because the client considers security a priority (i.e. storing/using sensitive information on backend).

### Routes
Routes define the HTTP endpoints and map them to controller methods. They handle:
- Request validation
- Response formatting

**Example**: `/api/auth/login` -> `AuthController.login()`

### Controllers
Controllers handle HTTP request/response logic and coordinate between routes and services. They:
- Parse request data
- Call service functions
- Handle errors and status codes

**Example**: `AuthController.login()` calls `AuthService.authenticate()` and returns JWT token

### Services
Services contain business logic and external API calls. They:
- Implement core application functionality
- Makes calls to external services (InfluxDB, PostgreSQL etc.)

**Example**: `AuthService.authenticate()` validates InfluxDB tokens and generates JWTs

## Directory Structure

```
src/
├── controllers/     # HTTP request handlers
├── middleware/      # Express middleware (auth, validation)
├── routes/          # API endpoint definitions
├── services/        # Business logic and external API calls
├── types/           # TypeScript interfaces (basically just the way to define a type)
└── index.ts         # Server entry point
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/login` - Authenticate using JWT with InfluxDB token
