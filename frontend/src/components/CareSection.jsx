import Button from '@mui/material/Button';

const careTips = [
  ['01', '◌', 'Nước ổn định', 'Theo dõi nhiệt độ, pH và chất lượng nước phù hợp với từng loài.'],
  ['02', '✳', 'Cho ăn vừa đủ', 'Chọn thức ăn phù hợp, cho lượng cá ăn hết trong vài phút.'],
  ['03', '⌁', 'Bể sạch, cá vui', 'Thay một phần nước định kỳ và vệ sinh lọc đúng cách.'],
  ['04', '♡', 'Cách ly cá mới', 'Quan sát cá mới trước khi thả chung để bảo vệ cả đàn.'],
];

export default function CareSection() {
  return (
    <>
      <section className="care-band" id="care">
        <div className="care-photo" role="img" aria-label="Bể cá thủy sinh xanh mát" />
        <div className="care-copy">
          <div className="eyebrow light"><span /> BẮT ĐẦU ĐÚNG CÁCH</div>
          <h2>Một chiếc bể tốt<br />bắt đầu từ <em>hiểu biết.</em></h2>
          <p>Chọn đúng kích thước bể, chuẩn bị nước và tạo môi trường ổn định trước khi đón cá về nhà.</p>
          <Button className="button button-lime" href="#starter" endIcon={<span>↗</span>}>Xem hướng dẫn cho người mới</Button>
          <div className="care-foot"><span>01 / DỰNG BỂ</span><span>02 / CHỌN CÁ</span><span>03 / CHĂM SÓC</span></div>
        </div>
      </section>

      <section className="section essentials" id="starter">
        <div className="eyebrow"><span /> KIẾN THỨC NỀN TẢNG</div>
        <div className="section-heading compact"><h2>Chăm sóc tốt bắt đầu<br />từ những <em>điều nhỏ.</em></h2><p>Những điều căn bản giúp cá khỏe mạnh và bể luôn trong lành.</p></div>
        <div className="tips-grid">
          {careTips.map(([number, icon, title, text]) => (
            <article className="tip-card" key={number}>
              <span className="tip-number">{number}</span><span className="tip-icon">{icon}</span>
              <h3>{title}</h3><p>{text}</p><a href="#health">Tìm hiểu thêm <span>↗</span></a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
