import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';

function FishCard({ fish, saved, onSelectFish, onToggleFavorite, canSave }) {
  return (
    <Card className="fish-card" elevation={0}>
      <div className="fish-image" style={{ backgroundImage: `linear-gradient(0deg, #102c273b, transparent 45%), url("${fish.image}")` }}>
        <span className="card-tag">{fish.category}</span>
        {canSave !== 'hidden' && <IconButton className={`heart ${saved ? 'saved' : ''}`} aria-label={saved ? `Bỏ lưu ${fish.name}` : canSave ? `Lưu ${fish.name}` : `Đăng nhập để lưu ${fish.name}`} aria-pressed={saved} onClick={() => onToggleFavorite(fish.id)}>
          {saved ? <Favorite /> : <FavoriteBorder />}
        </IconButton>}
      </div>
      <div className="fish-info">
        <div>
          <button className="fish-name" type="button" onClick={() => onSelectFish(fish)}>{fish.name}</button>
          <p><em>{fish.scientificName}</em> · {fish.description}</p>
        </div>
        <Chip className={`difficulty ${fish.level}`} label={fish.difficulty} size="small" />
      </div>
      <div className="fish-meta">
        <span>✧ {fish.summary}</span>
        <Button className="fish-open" onClick={() => onSelectFish(fish)}>Xem hồ sơ ↗</Button>
      </div>
    </Card>
  );
}

export default function SpeciesSection({ fish, onSelectFish, user, favorites, onToggleFavorite, showFavorites, onToggleFavoriteView }) {
  return (
    <section className="section species-section" id="species">
      <div className="section-heading">
        <div><div className="eyebrow"><span /> KHÁM PHÁ CÁ NƯỚC NGỌT</div><h2>Mỗi loài cá, một<br /><em>cá tính riêng.</em></h2></div>
        <div className="species-actions">
          <p>Từ những người bạn dễ gần cho người mới đến các sắc màu đầy mê hoặc cho bể cá của bạn.</p>
          {user?.role === 'customer' && <Button className={`favorite-filter ${showFavorites ? 'active' : ''}`} onClick={onToggleFavoriteView}>{showFavorites ? 'Xem tất cả cá' : `Cá yêu thích (${favorites.length})`}</Button>}
        </div>
      </div>

      <div className="species-grid">
        {fish.length ? fish.map((item) => <FishCard fish={item} key={item.id} saved={favorites.includes(item.id)} canSave={user?.role === 'admin' ? 'hidden' : user?.role === 'customer'} onSelectFish={onSelectFish} onToggleFavorite={onToggleFavorite} />) : <p className="empty-state">{showFavorites ? 'Bạn chưa có cá yêu thích nào. Hãy bấm biểu tượng trái tim trên một hồ sơ cá để lưu lại nhé.' : 'Chưa tìm thấy loài cá phù hợp. Hãy thử đổi từ khóa hoặc bộ lọc nhé.'}</p>}
      </div>

      <div className="center-link"><Button className="text-link" href="#species">Xem tất cả loài cá <span>↗</span></Button></div>
    </section>
  );
}
