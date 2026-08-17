#!/bin/bash
set -e

echo "Cleaning up old VietIS_new..."
rm -rf /root/VietIS_new

echo "Cloning latest code from GitHub..."
git clone --progress https://github.com/sunlight3d/VietIS.git /root/VietIS_new

echo "Copying files to deploy directory..."
cp -a /root/VietIS_new/KhoaHocViberCoding10buoi/17-08-2026/. /root/deploy-17-08-2026/

cd /root/deploy-17-08-2026

echo "Updating docker-compose.yml..."
cat << 'EOF' > docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: task_db
    environment:
      POSTGRES_DB: TaskDB
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: Abc123456789
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: task_web
    ports:
      - "3002:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:Abc123456789@postgres:5432/TaskDB?schema=public
    env_file:
      - .env
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
    external: true
    name: task-app_postgres_data
EOF

echo "Updating db_push.sh..."
cat << 'EOF' > db_push.sh
#!/bin/bash
docker run --rm -v /root/deploy-17-08-2026/prisma:/app/prisma -v /root/deploy-17-08-2026/prisma.config.ts:/app/prisma.config.ts -w /app --network host node:22-alpine sh -c 'npm install prisma dotenv && npx prisma db push --accept-data-loss --url="postgresql://postgres:Abc123456789@127.0.0.1:5432/TaskDB?schema=public"'
EOF
chmod +x db_push.sh

echo "Stopping containers..."
docker compose down

echo "Cleaning up old containers to avoid naming conflicts..."
docker rm -f task_db task_web 2>/dev/null || true

echo "Starting Postgres..."
touch .env # Ensure .env exists to avoid docker compose error
docker compose up -d postgres

echo "Waiting for Postgres to be ready..."
sleep 5

echo "Pushing database schema..."
./db_push.sh

echo "Building and starting Web service..."
docker compose build
docker compose up -d web

echo "Deployment completed successfully!"
