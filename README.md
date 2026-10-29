# AquaAtlas Vietnam — Cẩm nang cá cảnh

AquaAtlas Vietnam là một website tiếng Việt giúp người chơi tìm hiểu cá cảnh, cách chăm sóc, sức khỏe cá và địa điểm mua cá tại Việt Nam. Dự án hiện dùng HTML, CSS và JavaScript thuần, nên có thể mở trực tiếp bằng trình duyệt mà chưa cần cài framework.

> Tài liệu này được viết cho người mới học lập trình. Mỗi đợt cập nhật sẽ ghi lại sản phẩm thay đổi ra sao, tệp nào phụ trách và code hoạt động như thế nào.

## Mở website trên máy

1. Tải hoặc sao chép thư mục dự án về máy.
2. Mở tệp `index.html` bằng trình duyệt.
3. Một số ảnh, video và font được lấy từ Internet, nên cần kết nối mạng để hiển thị đầy đủ.

## Cấu trúc dự án

```text
AboutFish/
├── index.html   # Nội dung và cấu trúc các khu vực trên trang
├── styles.css   # Màu sắc, font chữ, kích thước và bố cục
├── script.js    # Các tương tác như menu, bộ lọc và nút yêu thích
└── README.md    # Hướng dẫn và nhật ký cập nhật dự án
```

## Đọc code từ đâu?

### `index.html` — nội dung của trang

HTML mô tả những gì có trên trang và chia nội dung thành từng phần. Hãy xem thẻ `<body>` như phần khung của một trang tài liệu: mỗi `<section>` là một khu vực lớn, còn các thẻ `<h1>`, `<h2>`, `<p>`, `<a>` mô tả tiêu đề, đoạn văn và liên kết.

- `<head>` chứa tên tab trình duyệt, mô tả trang, cài đặt hiển thị trên điện thoại, font và đường dẫn đến CSS.
- `<header>` là thanh điều hướng. Các liên kết như `href="#species"` đưa người dùng tới phần có `id="species"`.
- `<main>` chứa nội dung chính: ảnh bìa, bộ lọc cá, thẻ loài cá, hướng dẫn chăm sóc, sức khỏe và khu vực cửa hàng.
- `<footer>` là phần cuối trang, chứa tên dự án và liên kết điều hướng.
- `class="..."` đặt tên cho một phần tử để CSS có thể trang trí nó hoặc JavaScript có thể tìm đến nó.
- `id="..."` là tên riêng của một phần tử. Một `id` được dùng để liên kết tới đúng khu vực hoặc để JavaScript chọn khu vực đó.
- Các thẻ `<video>` và `<source>` đặt video làm nền ảnh bìa. `autoplay`, `muted`, `loop` và `playsinline` lần lượt yêu cầu tự phát, tắt tiếng, phát lặp và phát trong khung trang trên điện thoại.
- Mỗi thẻ cá có các thuộc tính `data-water` và `data-level`. Đây là dữ liệu để bộ lọc trong JavaScript biết cá thuộc môi trường nào và có độ khó chăm sóc ra sao.

### `styles.css` — cách trang trông như thế nào

CSS chọn các phần tử HTML rồi đặt màu, font, khoảng cách và bố cục cho chúng. Ví dụ, `.hero` chọn phần tử có `class="hero"`, còn `.hero h1` chỉ chọn tiêu đề cấp một nằm bên trong phần ảnh bìa.

- Các biến trong `:root` như `--ink`, `--green` và `--lime` lưu màu dùng chung. Đổi một biến sẽ đổi màu tương ứng trên toàn trang.
- Quy tắc `body` đặt font và màu nền mặc định cho cả website.
- Các quy tắc `.hero`, `.species-grid`, `.care-band` và những class tương tự tạo bố cục cho từng khu vực.
- `@media (max-width: 720px)` là nhóm điều chỉnh giao diện cho màn hình hẹp như điện thoại. Các quy tắc bên trong chỉ được áp dụng khi màn hình nhỏ hơn ngưỡng đó.
- `@media (prefers-reduced-motion: reduce)` giảm chuyển động cuộn và hiệu ứng chuyển cảnh theo cài đặt trợ năng của thiết bị.
- `object-fit: cover` giúp video phủ kín khung hình mà không bị kéo méo; một phần hình có thể bị cắt để vừa khung.

### `script.js` — những gì xảy ra khi người dùng thao tác

JavaScript tìm phần tử HTML bằng `document.querySelector(...)`, rồi gắn hành động cho những phần tử đó.

- **Menu trên điện thoại:** nút menu bật hoặc tắt class `open`. CSS dùng class này để hiện hoặc ẩn danh sách điều hướng.
- **Bộ lọc cá:** khi đổi lựa chọn môi trường hoặc mức chăm sóc, `filterFish()` so sánh giá trị bộ lọc với `data-water` và `data-level` trên từng thẻ. Thẻ không khớp sẽ được ẩn.
- **Nút trái tim:** bấm vào biểu tượng sẽ đổi giữa `♡` và `♥`. Hiện trạng thái yêu thích chỉ được lưu trong trang đang mở; tải lại trang sẽ xóa trạng thái đó.
- **Biểu mẫu email:** biểu mẫu kiểm tra email và hiện lời cảm ơn minh họa. Nó chưa gửi email tới máy chủ hay lưu địa chỉ ở đâu.
- **Video bìa:** nếu video báo lỗi, JavaScript ẩn video để ảnh tĩnh phía sau làm phương án dự phòng.

## Nhật ký cập nhật

### Bản đầu tiên — 29/10/2026

**Đã làm:**

- Tạo trang chủ với tên dự án **AquaAtlas Vietnam** và nội dung tiếng Việt.
- Tạo thanh điều hướng và các khu vực: ảnh bìa, bộ lọc cá, loài cá mẫu, hướng dẫn chăm sóc, sức khỏe, tìm cửa hàng, đăng ký nhận tin và chân trang.
- Thêm bộ lọc mẫu theo môi trường nước ngọt/nước mặn và độ khó chăm sóc.
- Thêm menu điện thoại, trạng thái yêu thích minh họa và thông báo sau khi gửi biểu mẫu.
- Dùng font Be Vietnam Pro để hiển thị tiếng Việt nhất quán hơn.
- Thêm video đại dương ở ảnh bìa cùng ảnh poster/dự phòng.
- Tạo bố cục thích ứng để trang dùng được trên màn hình lớn và điện thoại.

**Tệp liên quan:**

- `index.html` tạo nội dung và cấu trúc các khu vực.
- `styles.css` định nghĩa cách hiển thị trên máy tính và điện thoại.
- `script.js` điều khiển menu, bộ lọc, biểu tượng yêu thích và thông báo biểu mẫu.
- `README.md` giải thích dự án và ghi lại các đợt cập nhật.

**Điều cần hiểu về bản này:**

- Danh sách cá và nội dung chăm sóc hiện là dữ liệu mẫu, chưa lấy từ cơ sở dữ liệu.
- Khu vực cửa hàng chưa tra cứu cửa hàng thật; chọn tỉnh/thành chưa tạo kết quả.
- Biểu mẫu email chưa kết nối dịch vụ gửi thư.
- Ảnh, video và font được tải từ dịch vụ bên ngoài, vì vậy có thể cần Internet và có thể thay đổi theo dịch vụ cung cấp.

## Mẫu ghi nhật ký cho các bản tiếp theo

Sau mỗi đợt cập nhật, thêm một mục mới lên đầu phần **Nhật ký cập nhật** theo mẫu này. Mục tiêu là giúp người đọc biết đã thay đổi điều gì, tìm code ở đâu và có thể học thêm gì từ thay đổi đó.

```markdown
### Bản X — ngày/tháng/năm

**Đã làm:**
- Việc người dùng nhìn thấy hoặc có thể thao tác.

**Tệp liên quan:**
- `ten-tep.ext` — vai trò của tệp trong thay đổi.

**Cách hoạt động:**
- Giải thích bằng lời đơn giản code mới chạy như thế nào.

**Điều cần hiểu / giới hạn:**
- Nội dung mẫu, dịch vụ chưa kết nối hoặc điều cần làm tiếp.
```
