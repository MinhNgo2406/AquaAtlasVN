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
  {
    id: 'sai-gon-aqua', name: 'Sài Gòn Aqua', city: 'hcm',
    address: '78/1 Tôn Thất Thuyết, phường 16, Quận 4, TP. Hồ Chí Minh', phone: '0932 135 953',
    hours: 'Liên hệ cửa hàng để xác nhận', verifiedAt: '2026-11-03', verification: 'Đại lý ADA',
    note: 'Có tên trong danh sách nhà bán lẻ ADA; hỏi trực tiếp về cá và tồn kho trước khi đi.', source: 'https://www.adana.co.jp/cn/contents/distributors/shop.html', sourceLabel: 'Danh sách đại lý ADA',
  },
  {
    id: 'viet-aqua', name: 'Việt Aqua', city: 'hanoi',
    address: '67 Núi Trúc, Kim Mã, Ba Đình, Hà Nội', phone: '0936 336 685',
    hours: 'Liên hệ cửa hàng để xác nhận', verifiedAt: '2026-11-03', verification: 'Đại lý ADA',
    note: 'Có tên trong danh sách nhà bán lẻ ADA; hỏi trực tiếp về cá và tồn kho trước khi đi.', source: 'https://www.adana.co.jp/cn/contents/distributors/shop.html', sourceLabel: 'Danh sách đại lý ADA',
  },
  {
    id: 'thanh-tinh-aqua', name: 'Thanh Tinh Aqua', city: 'nhatrang',
    address: '49 Đặng Huy Trứ, phường Vĩnh Nguyên, Nha Trang, Khánh Hòa', phone: '0901 922 269',
    hours: 'Liên hệ cửa hàng để xác nhận', verifiedAt: '2026-11-03', verification: 'Đại lý ADA',
    note: 'Có tên trong danh sách nhà bán lẻ ADA; hỏi trực tiếp về cá và tồn kho trước khi đi.', source: 'https://www.adana.co.jp/cn/contents/distributors/shop.html', sourceLabel: 'Danh sách đại lý ADA',
  },
  {
    id: 'dang-khoa-can-tho', name: 'Cá Cảnh Đăng Khoa', city: 'cantho',
    address: '1206 Bùi Hữu Nghĩa, Cần Thơ', phone: '0393 586 774',
    hours: '08:00–10:30 và 13:00–16:30, theo website cửa hàng', verifiedAt: '2026-11-03', verification: 'Website cửa hàng',
    note: 'Website cửa hàng giới thiệu các loài cá nước ngọt và lịch làm việc; gọi xác nhận trước khi tới.', source: 'https://www.dangkhoatran.id.vn/', sourceLabel: 'Website Cá Cảnh Đăng Khoa',
  },
  {
    id: 'kamkoi-hai-phong', name: 'Koi Kamkoi', city: 'haiphong',
    address: '11/1A/15 Khúc Thừa Dụ, Lê Chân, Hải Phòng', phone: '0966 032 999',
    hours: 'Thay đổi theo ngày; xác nhận trước khi đi', verifiedAt: '2026-11-03', verification: 'Danh bạ địa phương',
    note: 'Danh bạ địa phương ghi nhận cửa hàng chuyên cá Koi; giờ và tình trạng hoạt động cần gọi xác nhận.', source: 'https://chamsocthucung.vn/dichvu/koi-kamkoi-le-chan-hai-phong/', sourceLabel: 'Danh bạ Koi Kamkoi',
  },
];

export const shopCities = [
  { id: 'hcm', name: 'TP. Hồ Chí Minh' },
  { id: 'hanoi', name: 'Hà Nội' },
  { id: 'haiphong', name: 'Hải Phòng' },
  { id: 'cantho', name: 'Cần Thơ' },
  { id: 'nhatrang', name: 'Nha Trang' },
];

export default shops;
