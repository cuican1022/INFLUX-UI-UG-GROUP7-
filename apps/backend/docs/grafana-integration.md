# Grafana Integration

## Overview

The backend integrates with Grafana to automatically create dashboards with Flux queries. This allows users to visualize their InfluxDB data directly in Grafana.

## Authentication

Supports two authentication methods:
- **API Token**: Set `GRAFANA_API_TOKEN` environment variable
- **Basic Auth**: Set `GRAFANA_USERNAME` and `GRAFANA_PASSWORD` environment variables

In the future, will add logic for users to 'connect' Grafana to their account.

## Dashboard Creation Flow

1. **Datasource Setup**: Creates InfluxDB v2 datasource in Grafana
2. **Dashboard Creation**: Generates dashboard with timeseries panel---in the future need options for different types of panels
3. **Flux Integration**: Embeds users Flux query in the panel
4. **URL Return**: Returns dashboard URL for user access

## API Endpoints

- `POST /api/grafana/dashboard` - Create dashboard with Flux query
- `GET /api/grafana/dashboard/:uid` - Get dashboard details
