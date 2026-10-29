# AquaAtlas Vietnam

AquaAtlas Vietnam là website tiếng Việt dành cho người yêu cá cảnh. Website giới thiệu các loài cá, kiến thức chăm sóc, sức khỏe cá và địa điểm mua cá tại Việt Nam. Giao diện được xây dựng bằng React, Vite và Material UI (MUI).

## Website có gì?

- Trang chủ với video nền đại dương.
- Danh mục sáu loài cá nước ngọt mẫu, có thể tìm theo tên và lọc theo nhóm nhiệt đới/nước mát hoặc độ khó chăm sóc.
- Trang hồ sơ riêng cho mỗi loài, gồm thông số tham khảo, thức ăn, cách nuôi theo nhóm, gợi ý bạn cùng bể và nguồn đọc thêm.
- Các khu vực giới thiệu chăm sóc cá, sức khỏe cá và tìm cửa hàng.
- Giao diện thích ứng với màn hình máy tính và điện thoại.

Danh sách hiện là mẫu ban đầu, chưa có tài khoản người dùng hay cơ sở dữ liệu. Danh sách cửa hàng chưa tra cứu địa điểm thật và biểu mẫu email chưa gửi thư. Website hiện tập trung vào cá nước ngọt; các thông số trong hồ sơ là hướng dẫn tham khảo, cần đối chiếu với nguồn cụ thể trước khi áp dụng.

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
