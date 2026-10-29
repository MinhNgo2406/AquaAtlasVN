# AquaAtlas Vietnam

AquaAtlas Vietnam là website tiếng Việt dành cho người yêu cá cảnh. Trang web cung cấp thông tin về cá nước ngọt, chăm sóc, sức khỏe cá và một số địa điểm mua cá tại Việt Nam.

## Tính năng hiện có

- Danh mục sáu loài cá nước ngọt mẫu, tìm kiếm và lọc theo nhóm nước hoặc độ khó.
- Hồ sơ từng loài với điều kiện bể, thức ăn, cách nuôi theo nhóm, gợi ý cá sống chung và nguồn đọc thêm.
- Hướng dẫn theo dõi các dấu hiệu sức khỏe bất thường.
- Danh sách cửa hàng tham khảo ở TP. Hồ Chí Minh, Hà Nội, Đà Nẵng và Cần Thơ.
- Đăng nhập demo chung cho khách/admin; khách có thể tạo tài khoản và lưu cá yêu thích.
- Dashboard demo để admin thêm, sửa và xóa hồ sơ cá.

Thông tin cá và cửa hàng là dữ liệu mẫu; hãy kiểm tra nguồn và xác nhận cửa hàng trước khi đến. Đăng nhập, dashboard và dữ liệu cá/yêu thích hiện vẫn là demo phía trình duyệt, chưa được nối với API hoặc cơ sở dữ liệu. Không dùng mật khẩu thật. Hướng dẫn sức khỏe không thay thế chẩn đoán thú y.

## Chạy toàn bộ bằng Docker

Cài Docker Desktop, mở ứng dụng đó, rồi mở Terminal ở thư mục dự án và chạy:

```bash
docker compose up --build
```

Khi quá trình khởi động hoàn tất, mở [http://localhost:8080](http://localhost:8080). Frontend chạy trong Nginx; yêu cầu `/api/` được chuyển tiếp tới backend. Chân trang hiển thị trạng thái kết nối API. Để dừng, nhấn `Ctrl+C`; sau đó có thể chạy `docker compose down`.

Backend hiện cung cấp endpoint kiểm tra trạng thái:

```text
http://localhost:8080/api/health
```

Kết quả thành công có dạng `{"status":"ok","service":"aqua-atlas-backend"}`. Hiện backend chưa xử lý đăng nhập, tài khoản, hồ sơ cá hoặc cơ sở dữ liệu; các phần đó vẫn là bản demo lưu trên trình duyệt.

## Cấu trúc dự án

- `frontend/` — ứng dụng React + Vite + Material UI; Docker build thành trang tĩnh bằng Nginx.
- `backend/` — API Node.js tối giản.
- `docker-compose.yml` — khởi động và nối hai dịch vụ.
- `README.md` — giới thiệu website và cách chạy.
- `CODE-WALKTHROUGH.txt` — ghi chú học code và lịch sử từng đợt cập nhật.

## Chạy riêng để phát triển

Mở hai Terminal. Terminal thứ nhất chạy backend:

```bash
cd backend
npm start
```

Terminal thứ hai chạy frontend:

```bash
cd frontend
npm install
npm run dev
```

Vite chuyển tiếp `/api` tới `http://localhost:3000`; mở địa chỉ frontend mà Vite in ra. Để tạo bản build frontend, chạy `npm run build` bên trong `frontend/`.

## Nguồn hình ảnh và video

- Ảnh: [Unsplash](https://unsplash.com/)
- Video nền: [Pexels](https://www.pexels.com/video/serene-underwater-exploration-of-coral-reef-35719731/)
