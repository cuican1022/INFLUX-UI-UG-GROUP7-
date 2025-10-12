# INFLUX-UI-UG-GROUP7
For SEP!
https://tryfanle.atlassian.net/jira/software/projects/BTS/boards/1

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Start Dev Environment
```bash
git clone https://github.cs.adelaide.edu.au/a1853076/INFLUX-UI-UG-GROUP7
cd INFLUX-UI-UG-GROUP7

# docker-compose up can take quite a while for the first download of all the images, so be patient!
docker-compose up
```

### Access Services

Frontend + backend server has hot reloading - modify any file, save and it should update accordingly.

- **Frontend**: http://localhost:5184
- **InfluxDB**: http://localhost:8086
- **Grafana**:  http://localhost:3006
- **Backend**:  http://localhost:3005
- **Postgres**: http://localhost:5433 (however the backend still connects to postgres on default port 5432, postgres is just exposed to root machine through port 5433)

**Important**: I would recommend setting everything up then navigating to the InfluxDB address (http://localhost:8086) and pressing on the Node.js button on their home page. InfluxDB provide a helpful client, where you can learn more about how to write and query data programatically using their API.

### InfluxDB Setup
- **Username**: `admin`
- **Password**: `admin123`
- **Organization**: `adelaide-influx-ug7`
- **Admin token (used for querying Influx API)**: `influx-admin-token-123`
- **Loading sample data**: 

1. Go to docker desktop and access the terminal in the InfluxDB container (Exec tab)
2. Run the following command: ```influx write --bucket influx-bucket --org adelaide-influx-ug7 --token influx-admin-token-123 --file /data/bird-migration.line --format=lp --precision ns```

### Grafana Login
- **Username**: `admin`
- **Password**: `admin123`

### PostgreSQL connection

You can connect to the postgres service cli exposed by Docker with this command:

```bash
psql -h localhost -p 5433 -U postgres
# Once in the postgres cli:
\l # Lists databases
\c atsys_influx # Connects to the database
\i /apps/backend/src/db/schema.sql # Example command to execute a schema file on the database
```

The Docker setup creates a default 'postgres' superuser with password 'password'. It also creates a 'atsys_influx' db. Docker has been configured to save db data through development, so closing Docker will not delete any data.

## Development Commands

*While in correct directory*

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f
```

## Aditional notes

- Always ```git fetch``` before pushing any local changes in case of conflicts
