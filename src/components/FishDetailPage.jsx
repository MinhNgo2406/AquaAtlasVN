import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

function Fact({ label, value }) {
  return <div className="fish-fact"><dt>{label}</dt><dd>{value}</dd></div>;
}

export default function FishDetailPage({ fish, onBack }) {
  return (
    <section className="fish-detail">
      <Button className="detail-back-inline" onClick={onBack}>← Quay lại danh mục cá</Button>

      <div className="detail-hero">
        <img src={fish.image} alt={fish.name} />
        <div className="detail-intro">
          <div className="eyebrow"><span /> {fish.category}</div>
          <h1>{fish.name}</h1>
          <p className="scientific-name">{fish.scientificName}</p>
          <p>{fish.description}</p>
          <Chip className={`difficulty ${fish.level}`} label={fish.difficulty} />
        </div>
      </div>

      <div className="detail-content">
        <section className="detail-panel">
          <div className="eyebrow"><span /> ĐIỀU KIỆN CƠ BẢN</div>
          <h2>Môi trường sống</h2>
          <dl className="fish-facts">
            <Fact label="Kích thước bể" value={fish.tank} />
            <Fact label="Nhiệt độ tham khảo" value={fish.temperature} />
            <Fact label="pH tham khảo" value={fish.ph} />
            <Fact label="Kích thước / đặc điểm" value={fish.summary} />
          </dl>
        </section>

        <section className="detail-panel">
          <div className="eyebrow"><span /> CHĂM SÓC HẰNG NGÀY</div>
          <h2>Điều cá cần</h2>
          <dl className="fish-facts">
            <Fact label="Nuôi theo nhóm" value={fish.groupSize} />
            <Fact label="Thức ăn" value={fish.food} />
            <Fact label="Sống chung" value={fish.compatibility} />
          </dl>
        </section>
      </div>

      <aside className="detail-sources">
        <h2>Nguồn tham khảo</h2>
        <p>Thông số là hướng dẫn tham khảo. Nhu cầu có thể khác giữa từng dòng cá và nguồn nuôi; hãy đối chiếu yêu cầu của cá tại nơi bán trước khi thả vào bể.</p>
        <ul>
          {fish.sources.map((source) => (
            <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a></li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
