# ====================================================================
# Dockerfile cho MovieTracker Frontend (React + Vite + Nginx)
# ====================================================================

# Giai đoạn 1: Build ứng dụng React với Node.js
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json và cài đặt thư viện
COPY package*.json bun.lock* ./
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Biến môi trường truyền vào khi build (mặc định /api khi chạy sau Reverse Proxy)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build bản production bundle vào thư mục dist
RUN npm run build

# Giai đoạn 2: Serve tĩnh bằng Nginx (Siêu nhẹ ~25MB)
FROM nginx:alpine AS runner

# Xóa cấu hình mặc định của Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copy cấu hình SPA Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy tệp tĩnh từ giai đoạn build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
