// Store details are sourced from official store pages where available.
// Verify stock and opening hours directly with each shop before visiting.
const shops = [
  {
    id: 'thuysinhtim-nghia-do', name: 'Thủy Sinh Tím — Nghĩa Đô', city: 'hanoi',
    address: 'Cuối ngõ 26 phố Nghĩa Đô, Cầu Giấy, Hà Nội', phone: '0865 313 256',
    hours: '09:00–21:00, hằng ngày', verifiedAt: '2026-11-03', verification: 'Nguồn chính thức',
    note: 'Cửa hàng cá cảnh, cây thủy sinh và phụ kiện.', source: 'https://thuysinhtim.vn/he-thong-cua-hang', sourceLabel: 'Hệ thống cửa hàng Thủy Sinh Tím',
  },
  {
    id: 'thuysinhtim-dai-la', name: 'Thủy Sinh Tím — Đại La', city: 'hanoi',
    address: '123 Đại La, Hai Bà Trưng, Hà Nội', phone: '0708 888 102',
    hours: '09:00–21:00, hằng ngày', verifiedAt: '2026-11-03', verification: 'Nguồn chính thức',
    note: 'Chi nhánh trong hệ thống Thủy Sinh Tím; gọi hỏi tồn cá trước khi đến.', source: 'https://thuysinhtim.vn/he-thong-cua-hang', sourceLabel: 'Hệ thống cửa hàng Thủy Sinh Tím',
  },
  {
    id: 'ht-aquarium', name: 'HT Aquarium', city: 'hcm',
    address: '58/5 Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh', phone: '',
    hours: 'Chưa xác minh', verifiedAt: '2026-11-03', verification: 'Danh bạ hãng Seachem',
    note: 'Đại lý vật tư thủy sinh; danh bạ hãng ghi nhận sản phẩm nước ngọt. Trang danh bạ không cho số hotline ở định dạng đủ chắc chắn, nên liên hệ qua danh bạ hoặc hỏi cửa hàng trước khi đến.', source: 'https://www.seachem.com/SDL/SDLDealerDetail.php?recID=213454', sourceLabel: 'Danh bạ đại lý Seachem',
  },
  {
    id: 'trung-tin', name: 'Cá Cảnh Thủy Sinh Trung Tín', city: 'hcm',
    address: '718 Trường Chinh, TP. Hồ Chí Minh', phone: '0983 278 508',
    hours: '08:00–21:00, theo website cửa hàng', verifiedAt: '2026-11-03', verification: 'Website cửa hàng',
    note: 'Cửa hàng cá cảnh và thủy sinh. Chỉ dùng kênh chính thức của cửa hàng để xác minh trước khi giao dịch.', source: 'https://cacanhthuysinhtrungtin.com/canh-bao-gia-mao-thuong-hieu-ca-canh-trung-tin/', sourceLabel: 'Thông tin và cảnh báo từ Trung Tín',
  },
  {
    id: 'thuysinhtim-nguyen-thai-binh', name: 'Thủy Sinh Tím — Nguyễn Thái Bình', city: 'hcm',
    address: '373 Nguyễn Thái Bình, phường 12, Tân Bình, TP. Hồ Chí Minh', phone: '0785 111 988',
    hours: '09:00–21:00, hằng ngày', verifiedAt: '2026-11-03', verification: 'Nguồn chính thức',
    note: 'Chi nhánh trong hệ thống Thủy Sinh Tím; gọi hỏi cá đang có trước khi đi.', source: 'https://thuysinhtim.vn/he-thong-cua-hang', sourceLabel: 'Hệ thống cửa hàng Thủy Sinh Tím',
  },
  {
    id: 'thuysinhtim-nguyen-binh-khiem', name: 'Thủy Sinh Tím — Nguyễn Bỉnh Khiêm', city: 'hcm',
    address: '26/43 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP. Hồ Chí Minh', phone: '0945 551 088',
    hours: '09:00–21:00, hằng ngày', verifiedAt: '2026-11-03', verification: 'Nguồn chính thức',
    note: 'Chi nhánh trong hệ thống Thủy Sinh Tím; gọi hỏi cá đang có trước khi đi.', source: 'https://thuysinhtim.vn/he-thong-cua-hang', sourceLabel: 'Hệ thống cửa hàng Thủy Sinh Tím',
  },
];

export const shopCities = [
  { id: 'hcm', name: 'TP. Hồ Chí Minh' },
  { id: 'hanoi', name: 'Hà Nội' },
];

export default shops;
