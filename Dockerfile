# Dockerfile
FROM node:20-slim

WORKDIR /app

# Install dependencies for Prisma
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

# Use a wrapper script or bash to run migrations and seed before starting
CMD ["sh", "-c", "npx prisma migrate dev --name init && npx prisma db seed && npm start"]
