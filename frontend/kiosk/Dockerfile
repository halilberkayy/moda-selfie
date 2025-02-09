FROM node:18-alpine as builder

WORKDIR /app

# Paket dosyalarını kopyala ve yükle
COPY package*.json ./
RUN npm ci
RUN npm install --save-dev @types/react-webcam

# Tüm kaynakları kopyala
COPY . .

# Projeyi derle
RUN npm run build

FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
