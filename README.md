# AquaAtlas Vietnam

AquaAtlas Vietnam là website tiếng Việt dành cho người yêu cá cảnh. Website giới thiệu các loài cá, kiến thức chăm sóc, sức khỏe cá và địa điểm mua cá tại Việt Nam. Giao diện được xây dựng bằng React, Vite và Material UI (MUI).

## Tính năng hiện có

- Trang chủ với video nền đại dương.
- Một số thẻ cá mẫu, có thể lọc theo môi trường nước và độ khó chăm sóc.
- Các khu vực giới thiệu chăm sóc cá, sức khỏe cá và tìm cửa hàng.
- Giao diện thích ứng với màn hình máy tính và điện thoại.

## Mở website

Yêu cầu Node.js và npm. Trong thư mục dự án, chạy:

```bash
npm install
npm run dev
```

Mở địa chỉ mà Vite hiển thị trong Terminal. Để tạo bản tĩnh có thể triển khai, chạy `npm run build`; các tệp đầu ra được tạo trong `dist/`. Ảnh, video và font được tải từ Internet.

## Tệp trong dự án

- `index.html` — phần tử gốc để React hiển thị ứng dụng.
- `src/` — component React, dữ liệu cá, giao diện và logic tương tác.
- `package.json` — lệnh chạy dự án và danh sách thư viện.
- `vite.config.js` — cấu hình Vite.
- `CODE-WALKTHROUGH.txt` — ghi chú học code và nhật ký các đợt cập nhật.

## Lưu ý

Nội dung loài cá hiện là dữ liệu mẫu. Danh sách cửa hàng, biểu mẫu email và thông tin sức khỏe chưa kết nối cơ sở dữ liệu hay dịch vụ bên ngoài.

## Nguồn hình ảnh và video

- Ảnh: [Unsplash](https://unsplash.com/)
- Video nền: [Pexels](https://www.pexels.com/video/serene-underwater-exploration-of-coral-reef-35719731/)
