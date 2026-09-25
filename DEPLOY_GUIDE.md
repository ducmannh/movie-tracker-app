# 🚀 Hướng Dẫn Triển Khai MovieTracker Lên Server & Trỏ Tên Miền (Docker)

Tài liệu này hướng dẫn chi tiết từng bước đưa toàn bộ hệ thống **MovieTracker** (.NET Web API + React/Vite + SQL Server) lên máy chủ VPS/Cloud (Ubuntu/Debian) bằng Docker và cấu hình trỏ tên miền kèm **chứng chỉ SSL HTTPS tự động miễn phí**.

---

## 🏗️ Kiến Trúc Triển Khai

```text
  Internet (Client)
         │
         ▼ (Port 80 / 443 - SSL HTTPS)
┌───────────────────────────────────────────────┐
│ Gateway Reverse Proxy (Caddy Server)          │
│ - Tự động cấp & gia hạn SSL Let's Encrypt      │
│ - Điều hướng tên miền                         │
└──────┬────────────────────────────────┬───────┘
       │                                │
       ▼ (/api/*)                       ▼ (/*)
┌─────────────────────────┐    ┌─────────────────────────┐
│ movietracker_backend    │    │ movietracker_frontend   │
│ (.NET 10 Web API :5032) │    │ (Nginx static SPA :80)  │
└────────────┬────────────┘    └─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ SQL Server Database     │
│ (100.86.236.104 hoặc DB)│
└─────────────────────────┘
```

---

## 📌 BƯỚC 1: Trỏ Tên Miền Về Địa Chỉ IP Của Server (DNS)

1. Đăng nhập vào trang quản lý tên miền (Cloudflare, Namecheap, GoDaddy, PA Vietnam, MatBao...).
2. Vào phần **Cấu hình DNS (DNS Management)** của tên miền bạn muốn dùng:
   - Thêm bản ghi **A Record**:
     - **Type**: `A`
     - **Name**: `@` (hoặc subdomain như `movie`, `app`)
     - **Content / Value**: `<Địa_chỉ_IP_Public_Server_Của_Bạn>` (ví dụ: `123.45.67.89`)
     - **TTL**: `Auto` hoặc `5 minutes`
   - (Tùy chọn) Thêm bản ghi **CNAME**:
     - **Type**: `CNAME`
     - **Name**: `www`
     - **Content**: `yourdomain.com`

---

## 📌 BƯỚC 2: Cài Đặt Docker & Docker Compose Trên Server

Nếu server của bạn là Ubuntu / Debian mới tinh, chạy các lệnh sau:

```bash
# 1. Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# 2. Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Cho phép chạy Docker không cần sudo
sudo usermod -aG docker $USER

# 4. Kiểm tra phiên bản Docker
docker --version
docker compose version
```

> **Lưu ý quan trọng**: Mở cổng **80** và **443** trên tường lửa của Server (UFW hoặc Security Group trên Cloud):
> ```bash
> sudo ufw allow 80/tcp
> sudo ufw allow 443/tcp
> sudo ufw reload
> ```

---

## 📌 BƯỚC 3: Đưa Code Lên Server

### Cách 1: Sử dụng Git (Khuyên dùng)
```bash
# Clone repository về server
git clone <URL_GIT_CUA_BAN> MovieTracker
cd MovieTracker
```

### Cách 2: Sao chép qua SCP / Rsync từ máy tính
```bash
# Từ PowerShell máy bạn:
scp -r c:\TTCNTT\MovieTracker user@<SERVER_IP>:/home/user/MovieTracker
```

---

## 📌 BƯỚC 4: Kiểm Tra Tệp Cấu Hình (.env)

Tệp `.env` đã được cấu hình sẵn tại thư mục gốc của dự án với tên miền của bạn:

```ini
# 1. Tên miền thực tế của bạn
DOMAIN=movietrackerapp.manh.pics

# 2. Chuỗi kết nối SQL Server (đảm bảo server kết nối được tới IP này)
DB_CONNECTION_STRING=Server=100.86.236.104;Database=MovieTrackerDb;User Id=sa;Password=Ducmanh234@;TrustServerCertificate=True;

# 3. Chuỗi bí mật JWT Token
JWT_SECRET=MovieTracker_Super_Secret_Jwt_Key_For_Authentication_2026_@!
JWT_ISSUER=MovieTrackerBE
JWT_AUDIENCE=MovieTrackerFE

# 4. Thời hạn Token
ACCESS_TOKEN_MINUTES=15
REFRESH_TOKEN_DAYS=7
```
*(Bấm `Ctrl + O` -> `Enter` để lưu, `Ctrl + X` để thoát nano)*.

---

## 📌 BƯỚC 5: Khởi Chạy Ứng Dụng Bằng Docker Compose

Chạy lệnh duy nhất sau để build và khởi động toàn bộ hệ thống:

```bash
docker compose up -d --build
```

Docker sẽ tự động:
1. **Biên dịch Backend** .NET Web API thành container siêu nhẹ.
2. **Biên dịch Frontend** React/Vite và đóng gói vào container Nginx.
3. **Khởi chạy Caddy Gateway**: Caddy tự động liên hệ với Let's Encrypt để **cấp chứng chỉ SSL HTTPS miễn phí** cho tên miền của bạn và tự động gia hạn trước khi hết hạn!

---

## 📌 BƯỚC 6: Kiểm Tra Trạng Thái & Hoàn Tất

1. Kiểm tra các container đang chạy:
   ```bash
   docker compose ps
   ```
   Bạn sẽ thấy 3 container: `movietracker_gateway`, `movietracker_backend`, `movietracker_frontend` đều ở trạng thái `Up`.

2. Xem logs nếu cần kiểm tra:
   ```bash
   # Xem log Gateway Caddy (kiểm tra SSL)
   docker compose logs -f gateway

   # Xem log Backend
   docker compose logs -f backend
   ```

3. **Mở trình duyệt và truy cập**:
   - Truy cập trang web: **`https://yourdomain.com`**
   - Bạn sẽ thấy ổ khóa bảo mật màu xanh (HTTPS hợp lệ).
   - Truy cập Swagger API (nếu cần test): **`https://yourdomain.com/swagger`**
   - Đăng nhập/Đăng ký: Cookie HttpOnly được thiết lập với cờ `Secure=true` an toàn tuyệt đối!

---

## 🔄 Cách Cập Nhật Code Khi Có Phiên Bản Mới

Mỗi khi bạn commit code mới lên Git, trên server chỉ cần:

```bash
cd MovieTracker
git pull
docker compose up -d --build
```
Dịch vụ sẽ tự động cập nhật mà không làm gián đoạn hệ thống!
