#!/usr/bin/env bash
# Starts the local PouyanPlatform backend stack (SQL Server, Redis, Elasticsearch,
# then the Spring Boot jar) for use with this Nuxt frontend's BACKEND_URL=http://localhost:8081.
#
# First-time setup only (one-time, not run by this script):
#   1. docker run -d --name sqlserver -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Sqladmin2000" \
#        -p 1433:1433 -v mssql-data:/var/opt/mssql mcr.microsoft.com/mssql/server:2022-latest
#   2. Restore the .bak into it (see restore-db.sh)
#
# Usage: ./scripts/start-local-backend.sh /path/to/pouyanplatform-backend-x.y.z.jar

set -euo pipefail

JAR_PATH="${1:-$HOME/Downloads/pouyanplatform-backend-2.0.0.jar}"
LOG_FILE="/tmp/backend.log"

if [ ! -f "$JAR_PATH" ]; then
  echo "Jar not found: $JAR_PATH" >&2
  exit 1
fi

echo "Starting/restarting docker containers..."
docker start sqlserver redis elasticsearch 2>/dev/null || true

echo "Waiting for SQL Server, Redis, Elasticsearch to be reachable..."
for i in $(seq 1 30); do
  if (echo > /dev/tcp/127.0.0.1/1433) 2>/dev/null && \
     (echo > /dev/tcp/127.0.0.1/6379) 2>/dev/null && \
     curl -sf -m 2 http://localhost:9200 >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "Killing any previous backend jar instance..."
pkill -f "$(basename "$JAR_PATH")" 2>/dev/null || true
sleep 2

echo "Starting backend jar (logs: $LOG_FILE)..."
DB_URL="jdbc:sqlserver://localhost:1433;databaseName=PouyanPlatform;encrypt=true;trustServerCertificate=true" \
DB_USERNAME=sa \
DB_PASSWORD=Sqladmin2000 \
KAVENEGAR_API_KEY=dummy \
MELLAT_TERMINAL_ID=0 \
MELLAT_USERNAME=dummy \
MELLAT_PASSWORD=dummy \
SAMAN_MERCHANT_ID=dummy \
nohup java -jar "$JAR_PATH" --spring.profiles.active=dev > "$LOG_FILE" 2>&1 &

echo "Started with PID $!. Waiting for it to come up..."
for i in $(seq 1 30); do
  if curl -sf -m 2 http://localhost:8081/actuator/health 2>/dev/null | grep -q '"status":"UP"'; then
    echo "Backend is UP on http://localhost:8081"
    exit 0
  fi
  sleep 2
done

echo "Backend did not report healthy in time — check $LOG_FILE" >&2
exit 1
