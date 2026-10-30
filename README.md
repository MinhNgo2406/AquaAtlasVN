# AquaAtlas Vietnam

AquaAtlas Vietnam là website tiếng Việt dành cho người yêu cá cảnh. Trang web cung cấp thông tin về cá nước ngọt, chăm sóc, sức khỏe cá và một số địa điểm mua cá tại Việt Nam.

## Tính năng hiện có

- Danh mục 10 loài cá nước ngọt: betta, bảy màu, neon, cardinal tetra, tetra lửa, tetra mũi đỏ, cầu vồng Boesemani, mún, vàng và thần tiên.
- Hồ sơ từng loài với điều kiện bể, thức ăn, cách nuôi theo nhóm, gợi ý cá sống chung và nguồn đọc thêm.
- Có thể chuyển ảnh hồ sơ giữa video cá bơi và ảnh tĩnh.
- Hướng dẫn theo dõi các dấu hiệu sức khỏe bất thường.
- Danh sách cửa hàng tham khảo ở TP. Hồ Chí Minh, Hà Nội, Đà Nẵng và Cần Thơ.
- Đăng nhập chung cho khách/admin; tài khoản, phiên đăng nhập và cá yêu thích được lưu qua backend/PostgreSQL.
- Dashboard admin thêm, sửa, xóa hồ sơ; ảnh, video, ghi công và nguồn tham khảo của mỗi loài cũng được lưu.

Thông tin cá và cửa hàng ban đầu là dữ liệu mẫu; hãy kiểm tra nguồn và xác nhận cửa hàng trước khi đến. PostgreSQL lưu tài khoản, phiên đăng nhập, hồ sơ cá và yêu thích. Nội dung cửa hàng, chăm sóc và sức khỏe vẫn là dữ liệu mẫu trong frontend. Hướng dẫn sức khỏe không thay thế chẩn đoán thú y.

## Chạy toàn bộ bằng Docker

Cài Docker Desktop, mở ứng dụng đó, rồi mở Terminal ở thư mục dự án và chạy:

```bash
docker compose up --build
```

Khi quá trình khởi động hoàn tất, mở [http://localhost:8080](http://localhost:8080). Frontend chạy trong Nginx; yêu cầu `/api/` được chuyển tiếp tới backend. Chân trang báo trạng thái backend và database. PostgreSQL tạo bảng tài khoản ở lần khởi động database đầu tiên; backend tự tạo các bảng còn lại, thêm dữ liệu cá mẫu nếu database chưa có cá, rồi giữ dữ liệu trong Docker volume. Để dừng, nhấn `Ctrl+C`; `docker compose down` giữ nguyên volume.

Backend hiện cung cấp endpoint kiểm tra trạng thái:

```text
http://localhost:8080/api/health
```

Kết quả thành công có dạng `{"status":"ok","service":"aqua-atlas-backend","database":"connected"}`. Backend cũng cung cấp API đăng ký/đăng nhập, lấy danh sách cá, quản lý hồ sơ dành cho admin và lưu cá yêu thích của khách.

Lần chạy đầu dùng tài khoản admin local `admin` / `aqua-demo`. Trước khi đưa website lên mạng, tạo tệp `.env` từ `.env.example`, đặt mật khẩu PostgreSQL và admin riêng, rồi bật `COOKIE_SECURE=true` khi đã dùng HTTPS. Không dùng thông tin mẫu ở môi trường công khai. Chỉ chạy `docker compose down -v` nếu chủ ý xóa dữ liệu database local.

Tài khoản cũ đã đăng ký trong trình duyệt có thể được chuyển lên máy chủ khi đăng nhập lần đầu bằng mật khẩu cũ. Dữ liệu cá admin đã lưu được chuyển lên khi admin đăng nhập lần đầu trên trình duyệt đó. Giữ browser data cho tới khi đã xác nhận nội dung xuất hiện trên website sau lần đăng nhập.

Các bảng chính gồm `users` (tài khoản), `auth_sessions` (phiên đăng nhập), `fish` (hồ sơ cá) và `favorites` (cá yêu thích). Cookie phiên có cờ HttpOnly; mật khẩu được băm ở backend trước khi lưu. PostgreSQL không mở cổng ra mạng công khai.

## Cấu trúc dự án

- `frontend/` — ứng dụng React + Vite + Material UI; Docker build thành trang tĩnh bằng Nginx.
- `backend/` — API Node.js, driver PostgreSQL, migration database và dữ liệu mẫu ban đầu.
- `docker-compose.yml` — khởi động frontend, backend, PostgreSQL và volume database.
- `README.md` — giới thiệu website và cách chạy.
- `CODE-WALKTHROUGH.txt` — ghi chú học code và lịch sử từng đợt cập nhật.

## Chạy frontend riêng để phát triển

Chạy database và backend bằng Docker trước để Vite có thể gọi API tại `localhost:3000`:

```bash
docker compose up -d database backend
```

Sau đó mở Terminal khác để chạy frontend:

```bash
cd frontend
npm install
npm run dev
```

Vite chuyển tiếp `/api` tới backend; mở địa chỉ frontend mà Vite in ra. Backend local có thể truy cập qua `localhost:3000`, PostgreSQL chỉ ở trong mạng Docker. Để tạo bản build frontend, chạy `npm run build` bên trong `frontend/`.

## Nguồn hình ảnh và video

- Ảnh cá betta trong hồ sơ: [Stacey Koenitz trên Pexels](https://www.pexels.com/photo/betta-fish-inside-an-aquarium-2564494/)
- Ảnh cá bảy màu: [Andrew Sheedy trên Wikimedia Commons, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Cobra_Guppy_(Poecilia_reticulata).JPG)
- Ảnh cá neon: [SOK trên Wikimedia Commons, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Paracheirodon_innesi_neon_tetra.jpg)
- Ảnh cá mún: [Usien trên Wikimedia Commons, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Xiphophorus_maculatus_Platy.JPG)
- Ảnh cá vàng: [Kateryna Martyniuk trên Wikimedia Commons, CC BY 4.0](https://commons.wikimedia.org/wiki/File:Carassiusauratus.jpg)
- Ảnh cá thần tiên: [Sarbast.T.Hameed trên Wikimedia Commons, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Pterophyllum_Scalare.jpg)
- Ảnh cá cầu vồng Boesemani: [Atamari trên Wikimedia Commons, CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:Melanotaenia_boesemani.jpg)
- Ảnh cardinal tetra: [Artūrs Grebstelis trên Wikimedia Commons, CC BY 2.0](https://commons.wikimedia.org/wiki/File:Cardinal_tetras.jpg)
- Ảnh tetra lửa: [Usien trên Wikimedia Commons, CC BY 3.0](https://commons.wikimedia.org/wiki/File:Funkensalmler_Feuertetra_oder_Feuersalmler_Hyphessobrycon_amandae.JPG)
- Ảnh tetra mũi đỏ: [Lerdsuwa trên Wikimedia Commons, CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:Brilliant_rummy_nose_-_Petitella_bleheri_-_2.jpg)
- Video nền: [Pexels](https://www.pexels.com/video/serene-underwater-exploration-of-coral-reef-35719731/)
- Video cá vàng trong bể: [Pexels](https://www.pexels.com/video/close-up-of-goldfish-in-a-home-aquarium-34576303/)
- Video hồ sơ betta: [Daisy Sparkleweather trên Pexels](https://www.pexels.com/video/a-betta-fish-swimming-inside-an-aquarium-6590365/)
- Video hồ sơ bảy màu: [Elvin Qasimov trên Pexels](https://www.pexels.com/video/vibrant-guppy-fish-swimming-in-aquarium-29466607/)
- Video hồ sơ neon: [The Nature Box trên Wikimedia Commons, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Neon_tetra_(Paracheirodon_innesi)_in_an_aquarium.webm)
- Video hồ sơ cá mún: [The Nature Box trên Wikimedia Commons, CC BY 4.0](https://commons.wikimedia.org/wiki/File:Southern_platyfish_(Xiphophorus_maculatus).webm)
- Video hồ sơ cá thần tiên: [João Pavese trên Pexels](https://www.pexels.com/video/close-up-view-of-a-swimming-angelfish-3824572/)

Ảnh và video tải từ nguồn bên ngoài nên cần kết nối Internet. Ảnh hồ sơ hiện dùng nguồn ảnh cụ thể theo từng loài và hiển thị liên kết ghi công ngay trên ảnh. Các giấy phép CC BY yêu cầu ghi tác giả và liên kết giấy phép; CC BY-SA có thêm điều kiện chia sẻ tương tự. Hãy mở trang nguồn trước khi tái sử dụng hoặc chỉnh sửa ảnh.

Thông số cá tetra và cầu vồng có ghi rõ khi nào là hướng dẫn chung theo nhóm. Chúng không thay thế yêu cầu riêng của cá tại cửa hàng hoặc nguồn nuôi.
