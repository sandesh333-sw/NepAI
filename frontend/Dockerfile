# Use Node.js 23 Alpine for build stage
FROM node:23-alpine as build

# Set working directory
WORKDIR /app

# Copy dependencies files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Use Nginx Alpine for production stage
FROM nginx:alpine

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose app port
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
