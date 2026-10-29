# AquaAtlas Vietnam

AquaAtlas Vietnam là website tiếng Việt dành cho người yêu cá cảnh. Website giới thiệu các loài cá, kiến thức chăm sóc, sức khỏe cá và địa điểm mua cá tại Việt Nam. Giao diện được xây dựng bằng React, Vite và Material UI (MUI).

## Website có gì?

- Trang chủ với video nền đại dương.
- Danh mục sáu loài cá nước ngọt mẫu, có thể tìm theo tên và lọc theo nhóm nhiệt đới/nước mát hoặc độ khó chăm sóc.
- Trang hồ sơ riêng cho mỗi loài, gồm thông số tham khảo, thức ăn, cách nuôi theo nhóm, gợi ý bạn cùng bể và nguồn đọc thêm.
- Hướng dẫn nhận biết một số dấu hiệu cá bất thường, kèm lưu ý kiểm tra chất lượng nước và tìm hỗ trợ chuyên môn.
- Danh sách cửa hàng tham khảo tại TP. Hồ Chí Minh, Hà Nội, Đà Nẵng và Cần Thơ, có liên kết bản đồ và nguồn thông tin.
- Dashboard admin demo để thêm, sửa, xóa hồ sơ cá. Dữ liệu được lưu trong trình duyệt bằng localStorage.
- Màn hình đăng nhập chung cho khách và admin; khách có thể tạo tài khoản demo, admin được đưa đến dashboard.
- Giao diện thích ứng với màn hình máy tính và điện thoại.

Danh sách cá và cửa hàng là dữ liệu mẫu. Thông tin cửa hàng có thể thay đổi, hãy xác nhận trước khi đến. Dashboard đăng nhập chỉ là bản minh họa phía trình duyệt, không phải bảo mật thật; dữ liệu chỉ lưu trên thiết bị hiện tại và chưa đồng bộ qua cơ sở dữ liệu. Không dùng tài khoản demo trên website công khai. Hướng dẫn sức khỏe không thay thế chẩn đoán thú y. Website hiện tập trung vào cá nước ngọt; thông số trong hồ sơ là hướng dẫn tham khảo, cần đối chiếu với nguồn cụ thể trước khi áp dụng.

## Mở dashboard admin demo

Chạy website bằng `npm run dev`, sau đó bấm **Đăng nhập** trên thanh điều hướng hoặc mở `http://localhost:5173/?auth=1`. Khách có thể đăng ký tài khoản trên trình duyệt; tài khoản admin demo là `admin`, mật khẩu `aqua-demo`. Admin được chuyển tới `?admin=1`, khách được chuyển về trang chủ. Dữ liệu tài khoản và cá chỉ lưu cục bộ, chưa đồng bộ. Đây chỉ là bước học giao diện; muốn dùng thật cần backend, cơ sở dữ liệu và đăng nhập được xác thực ở máy chủ.

## Chạy website trên máy

Yêu cầu Node.js và npm. Trong thư mục dự án, chạy:

```bash
npm install
npm run dev
```

Mở địa chỉ mà Vite hiển thị trong Terminal. Để tạo bản tĩnh có thể triển khai, chạy `npm run build`; các tệp đầu ra được tạo trong `dist/`.

Ảnh, video và font được tải từ Internet.

## Nguồn hình ảnh và video

- Ảnh: [Unsplash](https://unsplash.com/)
- Video nền: [Pexels](https://www.pexels.com/video/serene-underwater-exploration-of-coral-reef-35719731/)
