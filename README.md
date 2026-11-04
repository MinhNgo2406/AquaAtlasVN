# AquaAtlas Vietnam

AquaAtlas Vietnam là website tiếng Việt dành cho người yêu cá cảnh. Trang web cung cấp thông tin về cá nước ngọt, chăm sóc, sức khỏe cá và một số địa điểm mua cá tại Việt Nam.

## Tính năng hiện có

- Danh mục 45 hồ sơ cá nước ngọt, bổ sung nhiều dòng được chơi phổ biến như molly, cá kiếm, sọc ngựa, mây trắng, rasbora, barb, cá sặc, cá dĩa, Oscar, Koi, nhiều loại cá chuột, lau kiếng, chạch, cá cầu vồng, hồng két, ali vàng và cá hắc ma.
- Hồ sơ từng loài với điều kiện bể, thức ăn, cách nuôi theo nhóm, gợi ý cá sống chung, ngày đối chiếu và nguồn đọc thêm.
- Tìm theo tên thường gọi/tên khoa học; lọc theo nhóm nước, họ cá, độ khó, thể tích bể, tính cách và loại bể nuôi chung.
- Chọn tối đa ba loài để so sánh dung tích bể, nhiệt độ, pH, độ khó và chăm sóc.
- Có thể chuyển ảnh hồ sơ giữa video cá bơi và ảnh tĩnh; admin tải ảnh JPG/PNG/WebP/GIF và video MP4/WebM trực tiếp lên project.
- Hướng dẫn theo dõi sức khỏe: ghi triệu chứng, kiểm tra nước trước, nhận biết khi cần hỗ trợ chuyên môn; không thay chẩn đoán thú y.
- Tìm cửa hàng theo TP. Hồ Chí Minh, Hà Nội, Hải Phòng, Cần Thơ và Nha Trang; xem tất cả khu vực có dữ liệu, tìm theo tên/quận, mở bản đồ, gọi điện và xem nguồn/ngày đối chiếu. Hồ sơ chỉ hiển thị cửa hàng có nguồn; giờ và tồn cá cần được xác nhận trực tiếp.
- Đăng nhập chung cho khách/admin; tài khoản, phiên đăng nhập và cá yêu thích được lưu qua backend/PostgreSQL.
- Khách lưu hồ sơ bể theo tài khoản, đánh dấu loài đang nuôi, lập lịch chăm sóc lặp lại và ghi nhật ký từng lần kiểm tra/thay nước.
- Khách gửi báo cáo khi thấy thông tin cá/cửa hàng chưa đúng; admin xử lý trạng thái và ghi chú trong dashboard.
- Dashboard admin thêm, sửa, xóa hồ sơ cá; có kiểm tra ảnh, video, ghi công, thông số bể, nhóm tương thích và nguồn trước khi lưu.
- Admin quản lý danh bạ cửa hàng: thêm, sửa, ẩn và hiển thị lại. Cửa hàng công khai được đọc từ PostgreSQL, không cần sửa mã giao diện khi cập nhật danh bạ.

PostgreSQL lưu tài khoản, phiên đăng nhập, hồ sơ cá, yêu thích, cửa hàng, bể cá, lịch chăm sóc, nhật ký và báo cáo nội dung. Migration 010 nhập danh sách cửa hàng mẫu một lần; migration 011 thêm mười loài mới, còn migration 011–012 sửa năm liên kết ảnh bị sai. Trạng thái dữ liệu được lưu theo từng loài; chỉnh sửa admin được giữ nguyên khi khởi động lại. Ảnh lấy từ Wikimedia Commons và trang nguồn liên kết tác giả/giấy phép. Nếu nguồn ảnh bên ngoài tạm thời lỗi, giao diện dùng ảnh minh họa dự phòng. Mốc bể/nhiệt độ ở hồ sơ mới là hướng dẫn tham khảo cần kiểm tra thêm; ngày đối chiếu cửa hàng không bảo đảm tiệm đang mở/còn cá. Hướng dẫn sức khỏe không thay thế chẩn đoán thú y.

## Chạy toàn bộ bằng Docker để phát triển

Cài Docker Desktop, mở ứng dụng đó, rồi mở Terminal ở thư mục dự án và chạy:

```bash
docker compose up --build
```

Khi quá trình khởi động hoàn tất, mở [http://localhost:8080](http://localhost:8080). Frontend chạy trong Nginx; yêu cầu `/api/` và `/media/` được chuyển tiếp tới backend. Chân trang báo trạng thái backend và database. PostgreSQL tạo bảng tài khoản ở lần khởi động database đầu tiên; backend tự tạo các bảng còn lại, thêm dữ liệu cá mẫu nếu database chưa có cá, rồi giữ dữ liệu trong Docker volume. Để dừng, nhấn `Ctrl+C`; `docker compose down` giữ nguyên volume.

Trong dashboard, chọn ảnh bìa (JPG/PNG/WebP), ảnh động (GIF/WebP/APNG) hoặc video (MP4/WebM). File tối đa 50 MB được lưu vào `backend/uploads/` trong project; URL `/media/...` được ghi vào hồ sơ cá trong PostgreSQL. Thư mục này được giữ nguyên qua lần rebuild Docker. Khi muốn đưa file media lên GitHub, xem chúng trong `git status` rồi commit cùng thay đổi; dữ liệu hồ sơ trong PostgreSQL cần được lưu/chuyển riêng nếu triển khai một máy chủ khác. Khi chạy production, stack dùng Docker volume riêng `aqua_atlas_media` để giữ file qua lần triển khai; sao lưu volume media cùng với database.

Backend cung cấp endpoint kiểm tra trạng thái:

```text
http://localhost:8080/api/health
```

Kết quả thành công có dạng `{"status":"ok","service":"aqua-atlas-backend","database":"connected"}`. Backend cũng cung cấp API đăng nhập, hồ sơ cá admin, danh bạ cửa hàng công khai và quản trị, yêu thích, bể/lịch/nhật ký của khách và hàng chờ báo cáo dành cho admin. Migration 007 tạo các bảng dữ liệu cá nhân; migration 008 gắn nhóm họ cá cho hồ sơ cũ; migration 009 đưa 25 hồ sơ cá vào danh mục; migration 010 tạo danh bạ cửa hàng; migration 011 thêm 10 loài và sửa hai ảnh, migration 012 sửa thêm ba ảnh đã xác nhận URL sai. Các lần khởi động sau không nạp lại loài đã bị admin xóa.

Lần chạy đầu dùng tài khoản admin local `admin` / `aqua-demo`. Đây chỉ là thông tin để chạy local. Không dùng Compose phát triển hoặc tài khoản này trên mạng công khai. Chỉ chạy `docker compose down -v` nếu chủ ý xóa dữ liệu database local.

Tài khoản cũ đã đăng ký trong trình duyệt có thể được chuyển lên máy chủ khi đăng nhập lần đầu bằng mật khẩu cũ. Dữ liệu cá admin đã lưu được chuyển lên khi admin đăng nhập lần đầu trên trình duyệt đó. Giữ browser data cho tới khi đã xác nhận nội dung xuất hiện trên website sau lần đăng nhập.

Các bảng chính gồm `users`, `auth_sessions`, `fish`, `favorites`, `aquariums`, `care_tasks`, `care_logs` và `content_reports`. API chỉ trả bể/lịch/nhật ký có `user_id` thuộc phiên đang đăng nhập; admin có quyền xem và đổi trạng thái báo cáo. Cookie phiên có cờ HttpOnly; mật khẩu được băm ở backend trước khi lưu. PostgreSQL không mở cổng ra mạng công khai.

## Chuẩn bị triển khai công khai

Repo có cấu hình production riêng qua Caddy HTTPS, frontend Nginx, backend và PostgreSQL trong mạng riêng. Trước khi chạy, cần một máy chủ Docker có IP công khai, tên miền trỏ A/AAAA tới máy đó và cho phép inbound cổng 80/443. TLS được Caddy cấp tự động sau khi DNS hoạt động. Không đưa cổng PostgreSQL hoặc backend ra Internet.

Tạo `.env` bằng cách sao chép `.env.example`; thay tên miền thật, tên đăng nhập admin và tạo hai mật khẩu ngẫu nhiên. Ví dụ trên macOS/Linux:

```bash
cp .env.example .env
openssl rand -hex 32
```

Dùng một chuỗi tạo ra cho `POSTGRES_PASSWORD`, chuỗi khác cho `ADMIN_PASSWORD` (ít nhất 16 ký tự), và đặt `ADMIN_USERNAME` khác `admin`. Không chép mật khẩu vào Git hoặc gửi mật khẩu lên chat. Sau đó kiểm tra cấu hình và khởi chạy:

```bash
docker compose --env-file .env -f compose.production.yaml config
docker compose --env-file .env -f compose.production.yaml up -d --build
```

Mở `https://<tên-miền-của-bạn>` và kiểm tra `/api/health`. Có thể chạy kiểm tra khói chỉ đọc bằng `node scripts/smoke-test.mjs` (hoặc đặt `BASE_URL=https://<tên-miền>`). Để xem log: `docker compose --env-file .env -f compose.production.yaml logs -f`. Để dừng mà vẫn giữ dữ liệu: `docker compose --env-file .env -f compose.production.yaml down`.

**Sao lưu trước khi nâng cấp và định kỳ.** Chạy `./scripts/backup-production.sh` để tạo bản dump PostgreSQL, xác nhận dump đọc được và xóa bản lưu cũ hơn 30 ngày. Lưu thêm bản sao ngoài máy chủ (ví dụ kho lưu trữ riêng tư); thư mục `backups/` đã bị loại khỏi Git vì chứa dữ liệu tài khoản. `down` giữ volume, còn `down -v` xóa volume. Cấu hình này là nền tảng triển khai một máy chủ; hãy thử khôi phục bản sao trước khi phụ thuộc vào dữ liệu thật. Tính năng email nhận tin chưa kết nối, và nhiều hồ sơ cá còn được đánh dấu cần rà soát nguồn; hãy xem trạng thái từng hồ sơ trước khi dùng nội dung như hướng dẫn chuyên môn.

## Cấu trúc dự án

- `frontend/` — ứng dụng React + Vite + Material UI; Docker build thành trang tĩnh bằng Nginx.
- `backend/` — API Node.js, driver PostgreSQL, migration database và dữ liệu mẫu ban đầu.
- `docker-compose.yml` — khởi động frontend, backend, PostgreSQL và volume database.
- `compose.production.yaml` / `Caddyfile` — stack HTTPS production, không mở trực tiếp backend/database ra Internet.
- `scripts/smoke-test.mjs` — kiểm tra HTTP/API/ủy quyền cơ bản sau khi khởi chạy.
- `scripts/backup-production.sh` — sao lưu PostgreSQL production và kiểm tra tính đọc được của bản dump.
- `README.md` — giới thiệu website và cách chạy.
- `CODE-WALKTHROUGH.html` — cẩm nang học code có sơ đồ, liên kết tới tệp nguồn và lịch sử cập nhật.

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

## Cửa hàng tham khảo

- [Thủy Sinh Tím — hệ thống cửa hàng](https://thuysinhtim.vn/he-thong-cua-hang) — bốn chi nhánh tại Hà Nội và TP. Hồ Chí Minh; trang chính thức công bố số liên hệ và giờ 09:00–21:00.
- [HT Aquarium — danh bạ đại lý Seachem](https://www.seachem.com/SDL/SDLDealerDetail.php?recID=213454) — nguồn hãng ghi địa chỉ tại Quận 5, TP. Hồ Chí Minh. Tồn kho trên nguồn được ghi nhận lần cuối năm 2025; hỏi lại trước khi mua.
- [Cá Cảnh Thủy Sinh Trung Tín](https://cacanhthuysinhtrungtin.com/) — website cửa hàng và [cảnh báo kênh giả mạo](https://cacanhthuysinhtrungtin.com/canh-bao-gia-mao-thuong-hieu-ca-canh-trung-tin/); chỉ liên hệ qua kênh chính thức.
- [Danh sách đại lý ADA tại Việt Nam](https://www.adana.co.jp/cn/contents/distributors/shop.html) — ghi nhận Sài Gòn Aqua (TP.HCM), Việt Aqua (Hà Nội) và Thanh Tinh Aqua (Nha Trang).
- [Cá Cảnh Đăng Khoa](https://www.dangkhoatran.id.vn/) — website cửa hàng tự công bố địa chỉ và giờ tại Cần Thơ.
- [Koi Kamkoi](https://chamsocthucung.vn/dichvu/koi-kamkoi-le-chan-hai-phong/) — nguồn danh bạ địa phương cho Hải Phòng; gọi xác nhận trước khi đi.

Danh mục loài tham khảo danh sách loài phổ biến trong [nghiên cứu của Đại học Nông Lâm TP.HCM](https://fof.hcmuaf.edu.vn/data/file/51_%20DTQ%20Ngan%20_%20NM%20Duc-DHNL-Hien%20trang%20nuoi%20ca%20canh.pdf); thông số chăm sóc liên kết tới [hướng dẫn nhóm cá nước ngọt OATA](https://ornamentalfish.org/what-we-do/advice-information/care-sheets/caresheets-tropical-freshwater-fish/). Những hồ sơ mới cần được chuyên gia/người nuôi có kinh nghiệm rà soát trước khi xem như hướng dẫn riêng cho dòng cá.
