import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { shopCities } from '../data/shops.js';
import ContentReportButton from './ContentReportButton.jsx';

const warningSigns = [
  ['Bỏ ăn hoặc lờ đờ', 'Quan sát nhịp thở, khả năng bơi và xem có cá nào khác bị tương tự không.'],
  ['Đốm, loét hoặc đổi màu', 'Chụp ảnh rõ dưới ánh sáng trắng và ghi lại thời điểm dấu hiệu xuất hiện.'],
  ['Thở gấp hoặc nổi đầu', 'Kiểm tra nhiệt độ, lọc và sục khí; nếu nhiều cá cùng bị, ưu tiên kiểm tra nước.'],
  ['Bơi bất thường, sưng bụng', 'Cách ly nếu có thể mà không gây thêm stress, rồi hỏi bác sĩ thú y thủy sản hoặc người có chuyên môn.'],
];

const healthSteps = [
  ['01', 'Ghi nhận thay đổi', 'Thời điểm bắt đầu, số cá bị ảnh hưởng, nhịp thở, khả năng bơi và lượng ăn. Chụp ảnh/video dưới ánh sáng bình thường.'],
  ['02', 'Kiểm tra nước trước', 'Đo ammonia, nitrite, nitrate, pH và nhiệt độ bằng bộ test phù hợp. Ammonia và nitrite nên ở mức 0 mg/L; nếu bất thường, kiểm tra lọc và xử lý nước an toàn.'],
  ['03', 'Giảm lây lan và hỏi chuyên môn', 'Không tự trộn thuốc. Chỉ cách ly khi có bể cách ly đã chuẩn bị phù hợp; nếu nhiều cá khó thở, chết nhanh hoặc tình trạng xấu đi, liên hệ bác sĩ thú y thủy sản/người có chuyên môn.'],
];

const INITIAL_SHOP_COUNT = 3;

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
        <div className="health-checklist">
          <h3>Ba bước kiểm tra an toàn ban đầu</h3>
          <div>{healthSteps.map(([number, title, detail]) => <article key={number}><span>{number}</span><section><strong>{title}</strong><p>{detail}</p></section></article>)}</div>
        </div>
        <p className="health-caution">Không tự phối hợp thuốc hoặc tăng liều theo mẹo trên mạng. Chẩn đoán bệnh cá thường cần thêm thông tin về chất lượng nước và có thể cần kiểm tra chuyên môn.</p>
        <div className="health-sources">
          <a className="health-source" href="https://www.merckvetmanual.com/multimedia/table/common-signs-of-illness-in-fish" target="_blank" rel="noreferrer">Merck Veterinary Manual — dấu hiệu cá mắc bệnh ↗</a>
          <a className="health-source" href="https://ornamentalfish.org/what-we-do/advice-information/care-sheets/caresheets-tropical-freshwater-fish/how-to-look-after-tetras-and-pencilfish/" target="_blank" rel="noreferrer">OATA — kiểm tra nước và chăm sóc cá nhiệt đới ↗</a>
        </div>
      </section>
    </>
  );
}

function ShopSection({ user, shops = [] }) {
  const [city, setCity] = useState('hcm');
  const [shopQuery, setShopQuery] = useState('');
  const [showAllShops, setShowAllShops] = useState(false);
  const selectedCity = shopCities.find((item) => item.id === city);
  const cityShops = shops.filter((shop) => (city === 'all' || shop.city === city) && `${shop.name} ${shop.address}`.toLocaleLowerCase('vi').includes(shopQuery.trim().toLocaleLowerCase('vi')));
  const visibleShops = showAllShops ? cityShops : cityShops.slice(0, INITIAL_SHOP_COUNT);

  useEffect(() => {
    setShowAllShops(false);
  }, [city, shopQuery]);

  return (
    <section className="shop-section" id="shops">
      <div className="shop-copy">
        <div className="eyebrow light"><span /> KẾT NỐI NGƯỜI CHƠI</div>
        <h2>Tìm nơi mua cá<br />gần <em>bạn.</em></h2>
        <p>Chọn khu vực để xem cửa hàng đã có nguồn tham khảo. Danh sách hiện có tại TP.HCM, Hà Nội, Nha Trang, Cần Thơ và Hải Phòng; hãy xác nhận tồn cá và giờ trước khi đi.</p>
        <div className="shop-search">
          <label htmlFor="city-select">Tỉnh / thành phố</label>
          <div className="shop-search-controls">
            <FormControl fullWidth size="small">
              <Select id="city-select" value={city} onChange={(event) => setCity(event.target.value)}>
                <MenuItem value="all">Tất cả khu vực đang có dữ liệu</MenuItem>
                {shopCities.map((item) => <MenuItem value={item.id} key={item.id}>{item.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Button aria-label="Xem cửa hàng" onClick={() => document.querySelector('#shop-results')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>↗</Button>
          </div>
          <TextField className="shop-area-search" label="Tên tiệm hoặc quận" size="small" value={shopQuery} onChange={(event) => setShopQuery(event.target.value)} placeholder="Ví dụ: Quận 5" />
        </div>
        <small>Địa chỉ, giờ và tồn cá có thể thay đổi. Gọi tiệm trước khi đến. “Ngày kiểm tra” là ngày chúng tôi đối chiếu nguồn, không bảo đảm cửa hàng đang mở.</small>
      </div>
      <div className="shop-image shop-video-wrap" role="img" aria-label="Cá vàng bơi trong bể cá" >
        <video
          className="shop-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onError={(event) => { event.currentTarget.hidden = true; }}
        >
          <source src="https://videos.pexels.com/video-files/34576303/14651866_3840_2160_25fps.mp4" type="video/mp4" />
        </video>
        <span className="shop-video-shade" aria-hidden="true" />
      </div>
      <div className="shop-results" id="shop-results" aria-live="polite">
        <div className="eyebrow"><span /> {city === 'all' ? 'TOÀN BỘ KHU VỰC CÓ DỮ LIỆU' : selectedCity?.name.toLocaleUpperCase('vi')}</div>
        <div className="shop-card-grid">
          {visibleShops.map((shop) => (
            <article className="shop-card" key={shop.id}>
              <div className="shop-card-top"><h3>{shop.name}</h3><span>{shop.verification}</span></div>
              <p>{shop.address}</p>
              <dl className="shop-details">
                <div><dt>Điện thoại</dt><dd>{shop.phone ? <a href={`tel:${shop.phone.replaceAll(' ', '')}`}>{shop.phone}</a> : 'Chưa có số đã xác minh'}</dd></div>
                <div><dt>Giờ mở cửa</dt><dd>{shop.hours}</dd></div>
                <div><dt>Đối chiếu nguồn</dt><dd>{shop.verifiedAt}</dd></div>
              </dl>
              <small>{shop.note}</small>
              <div className="shop-card-links">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name} ${shop.address}`)}`} target="_blank" rel="noreferrer">Mở bản đồ ↗</a>
                <a href={shop.source} target="_blank" rel="noreferrer">{shop.sourceLabel} ↗</a>
              </div>
              <ContentReportButton user={user} targetType="shop" targetId={shop.id} targetLabel={shop.name} />
            </article>
          ))}
          {!cityShops.length && <div className="empty-state"><p>Chưa có cửa hàng khớp khu vực tìm kiếm này.</p>{user?.role === 'customer' && <><p>Biết một cửa hàng cá cảnh đáng tin cậy ở khu vực này?</p><ContentReportButton user={user} targetType="shop" targetId="directory-suggestion" targetLabel={`Gợi ý cửa hàng — ${shopQuery || selectedCity?.name || 'toàn quốc'}`} /></>}</div>}
        </div>
        {cityShops.length > INITIAL_SHOP_COUNT && (
          <div className="list-expand-actions">
            <Button
              className="list-expand-button"
              onClick={() => setShowAllShops((current) => !current)}
              aria-expanded={showAllShops}
            >
              {showAllShops ? 'Thu gọn danh sách' : `Xem thêm ${cityShops.length - INITIAL_SHOP_COUNT} cửa hàng`}
              <span aria-hidden="true">{showAllShops ? '↑' : '↓'}</span>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="newsletter">
      <div><div className="eyebrow"><span /> MỖI TUẦN MỘT CHÚT KIẾN THỨC</div><h2>Để bể cá của bạn<br />luôn <em>tràn sức sống.</em></h2></div>
      <div className="newsletter-coming-soon">
        <strong>Tính năng nhận tin sắp ra mắt</strong>
        <small>Website hiện chưa thu thập hoặc lưu địa chỉ email.</small>
      </div>
    </section>
  );
}

export default function HealthAndShops({ user, shops }) {
  return <><HealthSection /><ShopSection user={user} shops={shops} /><NewsletterSection /></>;
}
