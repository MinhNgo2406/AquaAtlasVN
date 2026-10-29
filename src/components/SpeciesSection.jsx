import { useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';

function FishCard({ fish }) {
  const [saved, setSaved] = useState(false);

  return (
    <Card className="fish-card" elevation={0}>
      <div className="fish-image" style={{ backgroundImage: `linear-gradient(0deg, #102c273b, transparent 45%), url("${fish.image}")` }}>
        <span className="card-tag">{fish.category}</span>
        <IconButton className="heart" aria-label={saved ? `Bỏ lưu ${fish.name}` : `Lưu ${fish.name}`} onClick={() => setSaved((value) => !value)}>
          {saved ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
      </div>
      <div className="fish-info">
        <div><h3>{fish.name}</h3><p>{fish.description}</p></div>
        <Chip className={`difficulty ${fish.level}`} label={fish.difficulty} size="small" />
      </div>
      <div className="fish-meta"><span>◷ {fish.lifespan}</span><span>◉ {fish.tank}</span><a href="#care" aria-label={`Tìm hiểu về ${fish.name}`}>↗</a></div>
    </Card>
  );
}

export default function SpeciesSection({ fish }) {
  return (
    <section className="section species-section" id="species">
      <div className="section-heading">
        <div><div className="eyebrow"><span /> CHỌN BẠN ĐỒNG HÀNH</div><h2>Mỗi loài cá, một<br /><em>cá tính riêng.</em></h2></div>
        <p>Từ những người bạn dễ gần cho người mới đến các sắc màu đầy mê hoặc cho bể cá của bạn.</p>
      </div>

      <div className="species-grid">
        {fish.length ? fish.map((item) => <FishCard fish={item} key={item.id} />) : <p className="empty-state">Chưa tìm thấy loài cá phù hợp. Hãy thử đổi bộ lọc nhé.</p>}
      </div>

      <div className="center-link"><Button className="text-link" href="#species">Xem tất cả loài cá <span>↗</span></Button></div>
    </section>
  );
}
