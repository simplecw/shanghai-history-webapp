FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build
RUN npm run build

# Use nginx to serve static files
FROM nginx:alpine

# Copy build artifacts
COPY --from=0 /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 5105

# Start nginx
CMD ["nginx", "-g", "daemon off;"]