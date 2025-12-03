# Use latest Node
FROM node:20-alpine

# Set working dir
WORKDIR /app

# Copy only package files first (cache layer)
COPY package*.json ./

# Install only production deps
RUN npm install --production

# Copy rest of backend code (src, routes, models, etc.)
COPY . .

# Cloud Run injects PORT env var — your app MUST listen on it
EXPOSE 8080

# Start your backend
CMD ["npm", "start"]
