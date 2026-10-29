import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import shops, { shopCities } from '../data/shops.js';

const warningSigns = [
  ['Bỏ ăn hoặc lờ đờ', 'Quan sát nhịp thở, khả năng bơi và xem có cá nào khác bị tương tự không.'],
  ['Đốm, loét hoặc đổi màu', 'Chụp ảnh rõ dưới ánh sáng trắng và ghi lại thời điểm dấu hiệu xuất hiện.'],
  ['Thở gấp hoặc nổi đầu', 'Kiểm tra nhiệt độ, lọc và sục khí; nếu nhiều cá cùng bị, ưu tiên kiểm tra nước.'],
  ['Bơi bất thường, sưng bụng', 'Cách ly nếu có thể mà không gây thêm stress, rồi hỏi bác sĩ thú y thủy sản hoặc người có chuyên môn.'],
];

function HealthSection() {
  return (
    <>
      <section className="health-section" id="health">
        <div className="health-art" aria-hidden="true">
          <div className="health-orbit orbit-one" /><div className="health-orbit orbit-two" />
          <div className="health-center">✳</div><span className="bubble bubble-a">◌</span><span className="bubble bubble-b">✧</span><span className="bubble bubble-c">⌁</span>
        </div>
        <div className="health-copy">
          <div className="eyebrow"><span /> SỨC KHỎE CÁ CẢNH</div>
          <h2>Nhận ra sớm.<br />Chăm sóc <em>đúng cách.</em></h2>
          <p>Cá bơi lờ đờ, bỏ ăn hay đổi màu? Ghi nhận dấu hiệu, kiểm tra môi trường nước và tìm hỗ trợ chuyên môn khi cần.</p>
          <Button className="button button-dark" href="#health-guide" endIcon={<span>↗</span>}>Xem dấu hiệu cần chú ý</Button>
          <small>Thông tin tham khảo; không thay thế chẩn đoán thú y.</small>
        </div>
      </section>
      <section className="section health-guide" id="health-guide">
        <div className="eyebrow"><span /> THEO DÕI SỨC KHỎE</div>
        <div className="section-heading compact"><h2>Dấu hiệu bất thường<br />cần <em>quan sát.</em></h2><p>Một dấu hiệu riêng lẻ chưa đủ để kết luận bệnh. Ghi chép triệu chứng và kiểm tra nước trước khi dùng thuốc.</p></div>
        <div className="health-signs">
          {warningSigns.map(([title, detail], index) => (
            <article className="health-sign" key={title}>
              <span className="tip-number">0{index + 1}</span><h3>{title}</h3><p>{detail}</p>
            </article>
          ))}
        </div>
        <p className="health-caution">Không tự phối hợp thuốc hoặc tăng liều theo mẹo trên mạng. Chẩn đoán bệnh cá thường cần thêm thông tin về chất lượng nước và có thể cần kiểm tra chuyên môn.</p>
        <a className="health-source" href="https://www.merckvetmanual.com/multimedia/table/common-signs-of-illness-in-fish" target="_blank" rel="noreferrer">Nguồn tham khảo: Merck Veterinary Manual — dấu hiệu cá mắc bệnh ↗</a>
      </section>
    </>
  );
}

function ShopSection() {
  const [city, setCity] = useState('hcm');
  const selectedCity = shopCities.find((item) => item.id === city);
  const cityShops = shops.filter((shop) => shop.city === city);

  return (
    <section className="shop-section" id="shops">
      <div className="shop-copy">
        <div className="eyebrow light"><span /> KẾT NỐI NGƯỜI CHƠI</div>
        <h2>Tìm nơi mua cá<br />gần <em>bạn.</em></h2>
        <p>Chọn khu vực để xem một số cửa hàng cá cảnh. Danh sách tham khảo từ trang cửa hàng và danh bạ địa phương; hãy xác nhận thông tin trước khi đi.</p>
        <div className="shop-search">
          <label htmlFor="city-select">Tỉnh / thành phố</label>
          <div className="shop-search-controls">
            <FormControl fullWidth size="small">
              <Select id="city-select" value={city} onChange={(event) => setCity(event.target.value)}>
                {shopCities.map((item) => <MenuItem value={item.id} key={item.id}>{item.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Button aria-label="Xem cửa hàng" onClick={() => document.querySelector('#shop-results')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>↗</Button>
          </div>
        </div>
        <small>Thông tin có thể thay đổi; gọi hoặc nhắn cửa hàng trước khi đến.</small>
      </div>
      <div className="shop-image" role="img" aria-label="Người chơi ngắm bể cá cảnh" />
      <div className="shop-results" id="shop-results" aria-live="polite">
        <div className="eyebrow"><span /> {selectedCity?.name.toLocaleUpperCase('vi')}</div>
        <div className="shop-card-grid">
          {cityShops.map((shop) => (
            <article className="shop-card" key={shop.id}>
              <h3>{shop.name}</h3><p>{shop.address}</p><small>{shop.note}</small>
              <div className="shop-card-links">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name} ${shop.address}`)}`} target="_blank" rel="noreferrer">Mở bản đồ ↗</a>
                <a href={shop.source} target="_blank" rel="noreferrer">{shop.sourceLabel} ↗</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [message, setMessage] = useState('Chỉ gửi nội dung hữu ích, bạn có thể hủy đăng ký bất cứ lúc nào.');

  function handleSubmit(event) {
    event.preventDefault();
    setMessage('Cảm ơn bạn! Tính năng đăng ký sẽ được kết nối khi hoàn thiện phiên bản tiếp theo.');
  }

  return (
    <section className="newsletter">
      <div><div className="eyebrow"><span /> MỖI TUẦN MỘT CHÚT KIẾN THỨC</div><h2>Để bể cá của bạn<br />luôn <em>tràn sức sống.</em></h2></div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="newsletter-email">Nhận mẹo chăm sóc cá và bài viết mới</label>
        <div className="email-field"><TextField id="newsletter-email" type="email" placeholder="Email của bạn" variant="standard" fullWidth required /><Button type="submit" aria-label="Đăng ký nhận tin">↗</Button></div>
        <small aria-live="polite">{message}</small>
      </form>
    </section>
  );
}

export default function HealthAndShops() {
  return <><HealthSection /><ShopSection /><NewsletterSection /></>;
}
