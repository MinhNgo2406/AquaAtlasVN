import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

export default function QuickSearch({ water, level, onWaterChange, onLevelChange }) {
  return (
    <section className="quick-search" aria-label="Tìm cá nhanh">
      <div className="search-intro">
        <span className="search-icon">⌕</span>
        <div><strong>Bạn đang tìm người bạn nào?</strong><small>Khám phá theo sở thích của bạn</small></div>
      </div>

      <FormControl className="search-field" size="small">
        <InputLabel id="water-label">Loại cá</InputLabel>
        <Select labelId="water-label" label="Loại cá" value={water} onChange={(event) => onWaterChange(event.target.value)}>
          <MenuItem value="all">Tất cả môi trường</MenuItem>
          <MenuItem value="fresh">Nước ngọt</MenuItem>
          <MenuItem value="salt">Nước mặn</MenuItem>
        </Select>
      </FormControl>

      <FormControl className="search-field" size="small">
        <InputLabel id="level-label">Mức độ chăm sóc</InputLabel>
        <Select labelId="level-label" label="Mức độ chăm sóc" value={level} onChange={(event) => onLevelChange(event.target.value)}>
          <MenuItem value="all">Mọi cấp độ</MenuItem>
          <MenuItem value="easy">Dễ bắt đầu</MenuItem>
          <MenuItem value="medium">Cần tìm hiểu thêm</MenuItem>
        </Select>
      </FormControl>

      <Button className="button button-dark" component="a" href="#species" endIcon={<span>↗</span>}>
        Tìm hiểu
      </Button>
    </section>
  );
}
