# AquaAtlas Vietnam

AquaAtlas Vietnam là website tiếng Việt dành cho người yêu cá cảnh. Trang web cung cấp thông tin về cá nước ngọt, chăm sóc, sức khỏe cá và một số địa điểm mua cá tại Việt Nam.

## Tính năng hiện có

- Danh mục sáu loài cá nước ngọt mẫu, tìm kiếm và lọc theo nhóm nước hoặc độ khó.
- Hồ sơ từng loài với điều kiện bể, thức ăn, cách nuôi theo nhóm, gợi ý cá sống chung và nguồn đọc thêm.
- Có thể chuyển ảnh hồ sơ giữa video cá bơi và ảnh tĩnh.
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

Khi quá trình khởi động hoàn tất, mở [http://localhost:8080](http://localhost:8080). Frontend chạy trong Nginx; yêu cầu `/api/` được chuyển tiếp tới backend. Chân trang hiển thị trạng thái kết nối API. PostgreSQL tạo bảng tài khoản ở lần khởi động database đầu tiên và giữ dữ liệu trong Docker volume. Để dừng, nhấn `Ctrl+C`; sau đó có thể chạy `docker compose down`.

Backend hiện cung cấp endpoint kiểm tra trạng thái:

```text
http://localhost:8080/api/health
```

Kết quả thành công có dạng `{"status":"ok","service":"aqua-atlas-backend"}`. Database đã có cấu trúc bảng để chuẩn bị lưu tài khoản, nhưng API đăng ký/đăng nhập chưa được nối vào đó; tài khoản, cá và yêu thích vẫn là bản demo lưu trên trình duyệt.

Mật khẩu PostgreSQL mặc định trong Compose chỉ dùng cho phát triển local. Có thể thay bằng biến môi trường `POSTGRES_PASSWORD`; không dùng mật khẩu mẫu này khi triển khai công khai. `docker compose down` giữ database volume. Chỉ dùng `docker compose down -v` khi muốn xóa luôn dữ liệu database local.

## Cấu trúc dự án

- `frontend/` — ứng dụng React + Vite + Material UI; Docker build thành trang tĩnh bằng Nginx.
- `backend/` — API Node.js và script SQL khởi tạo schema tài khoản.
- `docker-compose.yml` — khởi động frontend, backend, PostgreSQL và volume database.
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
- Ảnh cá betta trong hồ sơ: [Stacey Koenitz trên Pexels](https://www.pexels.com/photo/betta-fish-inside-an-aquarium-2564494/)
- Ảnh cá bảy màu trong hồ sơ: [Gaurav Kushwaha trên Pexels](https://www.pexels.com/photo/vibrant-aquarium-with-colorful-guppies-swimming-36426327/)
- Video nền: [Pexels](https://www.pexels.com/video/serene-underwater-exploration-of-coral-reef-35719731/)
- Video cá vàng trong bể: [Pexels](https://www.pexels.com/video/close-up-of-goldfish-in-a-home-aquarium-34576303/)
- Video hồ sơ betta: [Daisy Sparkleweather trên Pexels](https://www.pexels.com/video/a-betta-fish-swimming-inside-an-aquarium-6590365/)
- Video hồ sơ bảy màu: [Elvin Qasimov trên Pexels](https://www.pexels.com/video/vibrant-guppy-fish-swimming-in-aquarium-29466607/)
- Video hồ sơ neon: [The Nature Box trên Wikimedia Commons, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Neon_tetra_(Paracheirodon_innesi)_in_an_aquarium.webm)
- Video hồ sơ cá mún: [The Nature Box trên Wikimedia Commons, CC BY 4.0](https://commons.wikimedia.org/wiki/File:Southern_platyfish_(Xiphophorus_maculatus).webm)
- Video hồ sơ cá thần tiên: [João Pavese trên Pexels](https://www.pexels.com/video/close-up-view-of-a-swimming-angelfish-3824572/)

Video hồ sơ tải từ các nguồn bên ngoài; cần kết nối Internet. Trang chi tiết dùng ảnh loài cá làm poster/dự phòng. Hai video Wikimedia Commons được phân phối dưới giấy phép Creative Commons ghi ở trên; xem liên kết từng video để biết đầy đủ điều kiện ghi công.
