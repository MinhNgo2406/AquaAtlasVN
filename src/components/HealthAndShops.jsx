import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

function HealthSection() {
  return (
    <section className="health-section" id="health">
      <div className="health-art" aria-hidden="true">
        <div className="health-orbit orbit-one" /><div className="health-orbit orbit-two" />
        <div className="health-center">✳</div><span className="bubble bubble-a">◌</span><span className="bubble bubble-b">✧</span><span className="bubble bubble-c">⌁</span>
      </div>
      <div className="health-copy">
        <div className="eyebrow"><span /> SỨC KHỎE CÁ CẢNH</div>
        <h2>Nhận ra sớm.<br />Chăm sóc <em>đúng cách.</em></h2>
        <p>Cá bơi lờ đờ, bỏ ăn hay đổi màu? Tìm hiểu dấu hiệu thường gặp, cách theo dõi và thời điểm nên nhờ người có chuyên môn.</p>
        <Button className="button button-dark" href="#health-guide" endIcon={<span>↗</span>}>Tìm hiểu sức khỏe cá</Button>
        <small>Thông tin tham khảo, không thay thế chẩn đoán từ chuyên gia.</small>
      </div>
    </section>
  );
}

function ShopSection() {
  const [city, setCity] = useState('');

  return (
    <section className="shop-section" id="shops">
      <div className="shop-copy">
        <div className="eyebrow light"><span /> KẾT NỐI NGƯỜI CHƠI</div>
        <h2>Tìm nơi mua cá<br />gần <em>bạn.</em></h2>
        <p>Khám phá cửa hàng và trại cá cảnh tại các tỉnh thành Việt Nam. Hãy kiểm tra tình trạng cá và điều kiện vận chuyển trước khi mua.</p>
        <div className="shop-search">
          <label htmlFor="city-select">Tỉnh / thành phố</label>
          <div className="shop-search-controls">
            <FormControl fullWidth size="small">
              <Select id="city-select" value={city} displayEmpty onChange={(event) => setCity(event.target.value)}>
                <MenuItem value=""><em>Chọn khu vực của bạn</em></MenuItem>
                <MenuItem value="hcm">TP. Hồ Chí Minh</MenuItem>
                <MenuItem value="hanoi">Hà Nội</MenuItem>
                <MenuItem value="danang">Đà Nẵng</MenuItem>
                <MenuItem value="cantho">Cần Thơ</MenuItem>
              </Select>
            </FormControl>
            <Button aria-label="Tìm cửa hàng" onClick={() => document.querySelector('#shop-note')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>↗</Button>
          </div>
        </div>
        <small id="shop-note">Danh sách địa điểm sẽ được bổ sung và xác minh theo từng khu vực.</small>
      </div>
      <div className="shop-image" role="img" aria-label="Người chơi ngắm bể cá cảnh" />
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
