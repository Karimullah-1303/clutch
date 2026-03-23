# ==========================================
# STAGE 1: Build the React/Vite App
# ==========================================
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies first (caches them!)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Compile the React app into static HTML/CSS/JS (outputs to /app/dist)
RUN npm run build

# ==========================================
# STAGE 2: Serve with NGINX (Minimal Image)
# ==========================================
FROM nginx:alpine

# Remove the default NGINX config
RUN rm /etc/nginx/conf.d/default.conf

# 🚨 Inject our custom Reverse Proxy routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled static files from Stage 1 into NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (Standard HTTP port)
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]