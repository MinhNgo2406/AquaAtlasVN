import Button from '@mui/material/Button';
import PlayArrow from '@mui/icons-material/PlayArrow';

const videoPoster = 'https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=2200&q=90';

export default function HeroSection() {
  return (
    <section className="hero" id="home">
      <div className="hero-image" aria-hidden="true" />
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={videoPoster}
        aria-hidden="true"
        onError={(event) => { event.currentTarget.hidden = true; }}
      >
        <source src="https://videos.pexels.com/video-files/32613424/13907633_3840_2160_60fps.mp4" type="video/mp4" />
      </video>
      <div className="hero-shade" />

      <div className="hero-content">
        <div className="eyebrow light"><span /> CẨM NANG CÁ CẢNH VIỆT NAM</div>
        <h1>Một thế giới<br />nhỏ <em>đầy sắc màu.</em></h1>
        <p>Tìm hiểu về những người bạn dưới nước — từ chọn cá, dựng bể đến chăm sóc khỏe mạnh mỗi ngày.</p>
        <div className="hero-actions">
          <Button className="button button-lime" component="a" href="#species" endIcon={<span>↗</span>}>
            Khám phá các loài
          </Button>
          <a className="text-link light-link" href="#care">
            <span className="play"><PlayArrow /></span> Hướng dẫn cho người mới
          </a>
        </div>
        <div className="hero-note"><span className="note-icon">✳</span><span>Nuôi cá vui hơn khi<br />bạn hiểu điều cá cần.</span></div>
      </div>

      <div className="hero-caption"><span>01 — 04</span><span className="caption-line" /><span>NHỮNG SẮC MÀU DƯỚI MẶT NƯỚC</span></div>
      <a className="hero-scroll" href="#species">CUỘN ĐỂ KHÁM PHÁ <span>↓</span></a>
    </section>
  );
}
