FROM node:20-alpine

# Install postgresql-client for pg_isready command to check if the database is ready
RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
