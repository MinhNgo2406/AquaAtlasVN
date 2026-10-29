import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

export default function QuickSearch({ query, group, level, onQueryChange, onGroupChange, onLevelChange }) {
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
