import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

export default function QuickSearch({ query, group, level, tankSize, temperament, compatibility,
  onQueryChange, onGroupChange, onLevelChange, onTankSizeChange, onTemperamentChange, onCompatibilityChange }) {
  return (
    <section className="quick-search" aria-label="Tìm cá nhanh">
      <div className="search-intro">
        <span className="search-icon">⌕</span>
        <div><strong>Bạn đang tìm người bạn nào?</strong><small>Khám phá theo sở thích của bạn</small></div>
      </div>

      <TextField
        className="search-field search-name"
        label="Tên cá"
        placeholder="Ví dụ: cá neon"
        size="small"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />

      <FormControl className="search-field" size="small">
        <InputLabel id="group-label">Nhóm cá nước ngọt</InputLabel>
        <Select labelId="group-label" label="Nhóm cá nước ngọt" value={group} onChange={(event) => onGroupChange(event.target.value)}>
          <MenuItem value="all">Tất cả nhóm</MenuItem>
          <MenuItem value="tropical">Cá nhiệt đới</MenuItem>
          <MenuItem value="coldwater">Cá nước mát</MenuItem>
        </Select>
      </FormControl>

      <FormControl className="search-field" size="small">
        <InputLabel id="tank-size-label">Dung tích bể</InputLabel>
        <Select labelId="tank-size-label" label="Dung tích bể" value={tankSize} onChange={(event) => onTankSizeChange(event.target.value)}>
          <MenuItem value="all">Mọi kích thước</MenuItem>
          <MenuItem value="20">Từ 20L</MenuItem>
          <MenuItem value="45">Từ 45L</MenuItem>
          <MenuItem value="80">Từ 80L</MenuItem>
          <MenuItem value="120">Từ 120L</MenuItem>
        </Select>
      </FormControl>

      <FormControl className="search-field" size="small">
        <InputLabel id="temperament-label">Tính cách</InputLabel>
        <Select labelId="temperament-label" label="Tính cách" value={temperament} onChange={(event) => onTemperamentChange(event.target.value)}>
          <MenuItem value="all">Mọi tính cách</MenuItem>
          <MenuItem value="peaceful">Hiền, hợp bể cộng đồng</MenuItem>
          <MenuItem value="active">Bơi khỏe, cần không gian</MenuItem>
          <MenuItem value="independent">Có tính độc lập</MenuItem>
          <MenuItem value="semi-aggressive">Cần chọn bạn bể kỹ</MenuItem>
        </Select>
      </FormControl>

      <FormControl className="search-field" size="small">
        <InputLabel id="compatibility-label">Bể nuôi chung</InputLabel>
        <Select labelId="compatibility-label" label="Bể nuôi chung" value={compatibility} onChange={(event) => onCompatibilityChange(event.target.value)}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="community">Cộng đồng hiền</MenuItem>
          <MenuItem value="separate">Nên nuôi riêng</MenuItem>
          <MenuItem value="coldwater-community">Cộng đồng nước mát</MenuItem>
          <MenuItem value="large-community">Cộng đồng cá lớn</MenuItem>
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
