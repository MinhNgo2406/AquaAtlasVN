import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { useEffect, useState } from 'react';

const INITIAL_FISH_COUNT = 6;

function FishCard({ fish, saved, onSelectFish, onToggleFavorite, canSave, comparing, onToggleCompare, style }) {
  const [imageSource, setImageSource] = useState(fish.image);

  return (
    <Card className="fish-card" elevation={0} style={style}>
      <div className="fish-image">
        <img className="fish-card-photo" src={imageSource} alt={fish.name} loading="lazy" onError={() => setImageSource('/images/fish-placeholder.svg')} />
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
        <Button className={`compare-button ${comparing ? 'selected' : ''}`} onClick={() => onToggleCompare(fish.id)} aria-pressed={comparing}>
          {comparing ? 'Đã chọn so sánh' : '＋ So sánh'}
        </Button>
      </div>
    </Card>
  );
}

export default function SpeciesSection({ fish, allFish, onSelectFish, user, favorites, onToggleFavorite, showFavorites, onToggleFavoriteView, compareIds, onToggleCompare, onClearCompare }) {
  const [showAllFish, setShowAllFish] = useState(false);
  const fishIds = fish.map((item) => item.id).join('|');
  const comparedFish = allFish.filter((item) => compareIds.includes(item.id));
  const visibleFish = showAllFish ? fish : fish.slice(0, INITIAL_FISH_COUNT);
  const compareRows = [
    ['Kích thước bể tham khảo', 'tank'], ['Nhiệt độ', 'temperature'], ['pH', 'ph'],
    ['Độ khó', 'difficulty'], ['Tính cách', 'temperamentLabel'], ['Nuôi theo nhóm', 'groupSize'], ['Sống chung', 'compatibility'],
  ];
  const temperamentLabels = { peaceful: 'Hiền', active: 'Bơi khỏe', independent: 'Độc lập', 'semi-aggressive': 'Cần chọn bạn bể kỹ' };

  useEffect(() => {
    setShowAllFish(false);
  }, [fishIds]);

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
        {fish.length ? visibleFish.map((item, index) => (
          <FishCard
            fish={item}
            key={item.id}
            style={{ '--card-index': Math.min(index, 8) }}
            saved={favorites.includes(item.id)}
            canSave={user?.role === 'admin' ? 'hidden' : user?.role === 'customer'}
            comparing={compareIds.includes(item.id)}
            onToggleCompare={onToggleCompare}
            onSelectFish={onSelectFish}
            onToggleFavorite={onToggleFavorite}
          />
        )) : <p className="empty-state">{showFavorites ? 'Bạn chưa có cá yêu thích nào. Hãy bấm biểu tượng trái tim trên một hồ sơ cá để lưu lại nhé.' : 'Chưa tìm thấy loài cá phù hợp. Hãy thử đổi từ khóa hoặc bộ lọc nhé.'}</p>}
      </div>

      {fish.length > INITIAL_FISH_COUNT && (
        <div className="list-expand-actions">
          <Button
            className="list-expand-button"
            onClick={() => setShowAllFish((current) => !current)}
            aria-expanded={showAllFish}
          >
            {showAllFish ? 'Thu gọn danh sách' : `Xem thêm ${fish.length - INITIAL_FISH_COUNT} loài cá`}
            <span aria-hidden="true">{showAllFish ? '↑' : '↓'}</span>
          </Button>
        </div>
      )}

      <div className="compare-area" aria-live="polite">
        <div className="compare-heading"><div><strong>So sánh loài cá</strong><small>Chọn tối đa 3 loài để đối chiếu thông số.</small></div>{compareIds.length > 0 && <Button onClick={onClearCompare}>Bỏ chọn</Button>}</div>
        {comparedFish.length >= 2 ? <div className="compare-table-wrap"><table className="compare-table"><thead><tr><th>Tiêu chí</th>{comparedFish.map((item) => <th key={item.id}>{item.name}<em>{item.scientificName}</em></th>)}</tr></thead><tbody>{compareRows.map(([label, key]) => <tr key={key}><th>{label}</th>{comparedFish.map((item) => <td key={item.id}>{key === 'temperamentLabel' ? temperamentLabels[item.temperament] || 'Chưa cập nhật' : item[key] || 'Chưa cập nhật'}</td>)}</tr>)}</tbody></table></div> : <p className="compare-hint">Đã chọn {comparedFish.length}/3 loài. Chọn ít nhất hai loài trong danh mục để xem bảng.</p>}
      </div>

    </section>
  );
}
