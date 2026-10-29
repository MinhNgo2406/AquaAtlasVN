const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const heroVideo = document.querySelector('.hero-video');

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroVideo.pause();
  heroVideo.removeAttribute('autoplay');
  heroVideo.hidden = true;
}

heroVideo.addEventListener('error', () => {
  heroVideo.hidden = true;
});

menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Đóng menu' : 'Mở menu');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Mở menu');
  });
});

const waterFilter = document.querySelector('#water-filter');
const levelFilter = document.querySelector('#level-filter');
const fishCards = [...document.querySelectorAll('.fish-card')];

function filterFish() {
  fishCards.forEach((card) => {
    const matchesWater = waterFilter.value === 'all' || waterFilter.value === card.dataset.water;
    const matchesLevel = levelFilter.value === 'all' || levelFilter.value === card.dataset.level;
    card.hidden = !(matchesWater && matchesLevel);
  });
  document.querySelector('#species-grid').classList.toggle('filtered', waterFilter.value !== 'all' || levelFilter.value !== 'all');
}

waterFilter.addEventListener('change', filterFish);
levelFilter.addEventListener('change', filterFish);

document.querySelectorAll('.heart').forEach((button) => {
  button.setAttribute('role', 'button');
  button.setAttribute('tabindex', '0');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const saved = button.classList.toggle('saved');
    button.textContent = saved ? '♥' : '♡';
    button.setAttribute('aria-pressed', String(saved));
  });
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      button.click();
    }
  });
});

document.querySelector('#newsletter-form').addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('#form-message').textContent = 'Cảm ơn bạn! Tính năng đăng ký sẽ được kết nối khi hoàn thiện phiên bản tiếp theo.';
});
