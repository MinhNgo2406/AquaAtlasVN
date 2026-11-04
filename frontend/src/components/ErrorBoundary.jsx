import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('AquaAtlas không thể hiển thị trang:', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="app-error" role="alert">
          <p className="eyebrow"><span /> AQUAATLAS VIETNAM</p>
          <h1>Trang đang gặp trục trặc.</h1>
          <p>Tải lại trang để thử kết nối lại. Dữ liệu trong tài khoản được lưu trên máy chủ.</p>
          <button type="button" onClick={() => window.location.reload()}>Tải lại trang</button>
        </main>
      );
    }

    return this.props.children;
  }
}
