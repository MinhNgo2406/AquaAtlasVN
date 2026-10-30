import { useEffect, useState } from 'react';
import CareSection from './components/CareSection.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import AuthPage from './components/AuthPage.jsx';
import FishDetailPage from './components/FishDetailPage.jsx';
import HealthAndShops from './components/HealthAndShops.jsx';
import HeroSection from './components/HeroSection.jsx';
import QuickSearch from './components/QuickSearch.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SpeciesSection from './components/SpeciesSection.jsx';
import fishList from './data/fish.js';

export default function App() {
  const [fish, setFish] = useState(loadFish);
  const [apiReady, setApiReady] = useState(false);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [level, setLevel] = useState('all');
  const [activeFishId, setActiveFishId] = useState(() => new URLSearchParams(window.location.search).get('fish'));
  const [isAdminPage, setIsAdminPage] = useState(() => new URLSearchParams(window.location.search).get('admin') === '1');
  const [isAuthPage, setIsAuthPage] = useState(() => new URLSearchParams(window.location.search).get('auth') === '1');
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const activeFish = fish.find((item) => item.id === activeFishId);

  useEffect(() => {
    let active = true;
    apiRequest('/api/fish')
      .then((items) => {
        if (active && Array.isArray(items)) setFish(items);
      })
      .catch(() => {
        if (active) setFish(loadFish());
      })
      .finally(() => {
        if (active) setApiReady(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    apiRequest('/api/auth/me')
      .then(async ({ user: savedUser }) => {
        if (!active) return;
        setUser(savedUser);
        if (savedUser.role !== 'customer') return;

        try {
          const { fishIds } = await apiRequest('/api/favorites');
          if (active && fishIds.length) {
            setFavorites(fishIds);
            return;
          }
          const legacyFavorites = loadFavorites(savedUser);
          if (legacyFavorites.length) {
            await saveRemoteFavorites(legacyFavorites);
            if (active) setFavorites(legacyFavorites);
          }
        } catch {
          if (active) setFavorites(loadFavorites(savedUser));
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!apiReady || user?.role !== 'admin' || localStorage.getItem('aqua-atlas-fish-migrated')) return;
    const savedFish = localStorage.getItem('aqua-atlas-fish');
    if (!savedFish) return;

    let legacyFish;
    try {
      legacyFish = JSON.parse(savedFish);
    } catch {
      return;
    }
    if (!Array.isArray(legacyFish) || !legacyFish.length) return;

    apiRequest('/api/admin/fish/import', {
      method: 'PUT',
      body: JSON.stringify({ fish: legacyFish.map(mergeFishDefaults) }),
    })
      .then(() => apiRequest('/api/fish'))
      .then((items) => {
        setFish(items);
        localStorage.setItem('aqua-atlas-fish-migrated', 'true');
      })
      .catch((error) => console.error('Chưa chuyển được dữ liệu cá cũ lên máy chủ:', error));
  }, [apiReady, user]);

  useEffect(() => {
    function syncFishFromUrl() {
      setActiveFishId(new URLSearchParams(window.location.search).get('fish'));
      setIsAdminPage(new URLSearchParams(window.location.search).get('admin') === '1');
      setIsAuthPage(new URLSearchParams(window.location.search).get('auth') === '1');
    }

    window.addEventListener('popstate', syncFishFromUrl);
    return () => window.removeEventListener('popstate', syncFishFromUrl);
  }, []);

  useEffect(() => {
    document.title = isAdminPage && user?.role === 'admin'
      ? 'Quản trị — AquaAtlas Vietnam'
      : isAuthPage || (isAdminPage && user?.role !== 'admin')
      ? 'Đăng nhập — AquaAtlas Vietnam'
      : activeFish
      ? `${activeFish.name} — AquaAtlas Vietnam`
      : 'AquaAtlas Vietnam — Cẩm nang cá cảnh';
  }, [activeFish, isAdminPage, isAuthPage, user]);

  const normalizedQuery = normalize(query);
  const visibleFish = fish.filter((item) => {
    const matchesName = !normalizedQuery || normalize(`${item.name} ${item.scientificName}`).includes(normalizedQuery);
    const matchesGroup = group === 'all' || item.group === group;
    const matchesLevel = level === 'all' || item.level === level;
    const matchesFavorite = !showFavorites || favorites.includes(item.id);
    return matchesName && matchesGroup && matchesLevel && matchesFavorite;
  });

  function openFish(fish) {
    window.history.pushState({}, '', `?fish=${encodeURIComponent(fish.id)}`);
    setActiveFishId(fish.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goHome() {
    window.history.pushState({}, '', window.location.pathname);
    setActiveFishId(null);
    setIsAdminPage(false);
    setIsAuthPage(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showLogin() {
    window.history.pushState({}, '', '?auth=1');
    setActiveFishId(null);
    setIsAdminPage(false);
    setIsAuthPage(true);
  }

  async function finishLogin(nextUser) {
    setUser(nextUser);
    const adminLogin = nextUser.role === 'admin';
    let nextFavorites = [];
    if (!adminLogin) {
      try {
        nextFavorites = (await apiRequest('/api/favorites')).fishIds;
        const legacyFavorites = loadFavorites(nextUser);
        if (!nextFavorites.length && legacyFavorites.length) {
          nextFavorites = await saveRemoteFavorites(legacyFavorites);
        }
      } catch {
        nextFavorites = loadFavorites(nextUser);
      }
    }
    const pendingFishId = sessionStorage.getItem('aqua-atlas-pending-favorite');
    if (nextUser.role === 'customer' && pendingFishId && !nextFavorites.includes(pendingFishId)) {
      nextFavorites = [...nextFavorites, pendingFishId];
      try { await saveRemoteFavorites(nextFavorites); } catch { /* Keep this login usable if favorites are temporarily unavailable. */ }
    }
    sessionStorage.removeItem('aqua-atlas-pending-favorite');
    setFavorites(nextFavorites);
    setShowFavorites(false);
    window.history.pushState({}, '', adminLogin ? '?admin=1' : window.location.pathname);
    setIsAdminPage(adminLogin);
    setIsAuthPage(false);
    setActiveFishId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function logout() {
    try { await apiRequest('/api/auth/logout', { method: 'POST' }); } catch { /* Clear the local view even if the server is unreachable. */ }
    setUser(null);
    setFavorites([]);
    setShowFavorites(false);
    showLogin();
  }

  async function toggleFavorite(id) {
    if (user?.role !== 'customer') {
      sessionStorage.setItem('aqua-atlas-pending-favorite', id);
      showLogin();
      return;
    }
    const nextFavorites = favorites.includes(id)
      ? favorites.filter((favoriteId) => favoriteId !== id)
      : [...favorites, id];
    try {
      await saveRemoteFavorites(nextFavorites);
      setFavorites(nextFavorites);
    } catch (error) {
      console.error('Chưa lưu được cá yêu thích:', error);
    }
  }

  function toggleFavoritesView() {
    setQuery('');
    setGroup('all');
    setLevel('all');
    setShowFavorites((current) => !current);
  }

  async function saveFish(updatedFish) {
    const { fish: savedFish } = await apiRequest('/api/admin/fish', {
      method: 'PUT',
      body: JSON.stringify(updatedFish),
    });
    setFish((current) => current.some((item) => item.id === savedFish.id)
      ? current.map((item) => item.id === savedFish.id ? savedFish : item)
      : [...current, savedFish]);
  }

  async function deleteFish(id) {
    await apiRequest(`/api/admin/fish/${encodeURIComponent(id)}`, { method: 'DELETE' });
    setFish((current) => current.filter((item) => item.id !== id));
  }

  if (isAuthPage || (isAdminPage && user?.role !== 'admin')) {
    return <AuthPage onSuccess={finishLogin} onExit={goHome} />;
  }

  if (isAdminPage && user?.role === 'admin') {
    return <AdminDashboard fish={fish} onSaveFish={saveFish} onDeleteFish={deleteFish} onExit={goHome} onLogout={logout} user={user} />;
  }

  return (
    <>
      <SiteHeader compact={Boolean(activeFish)} onHome={goHome} user={user} onLogin={showLogin} onLogout={logout} />
      {activeFish ? (
        <main><FishDetailPage fish={activeFish} onBack={goHome} /></main>
      ) : (
        <main>
          <HeroSection />
          <QuickSearch
            query={query}
            group={group}
            level={level}
            onQueryChange={setQuery}
            onGroupChange={setGroup}
            onLevelChange={setLevel}
          />
          <SpeciesSection
            fish={visibleFish}
            user={user}
            favorites={favorites}
            showFavorites={showFavorites}
            onSelectFish={openFish}
            onToggleFavorite={toggleFavorite}
            onToggleFavoriteView={toggleFavoritesView}
          />
          <CareSection />
          <HealthAndShops />
        </main>
      )}
      <SiteFooter />
    </>
  );
}

function loadFish() {
  try {
    const savedFish = JSON.parse(localStorage.getItem('aqua-atlas-fish'));
    return Array.isArray(savedFish) ? savedFish.map(mergeFishDefaults) : fishList;
  } catch {
    return fishList;
  }
}

const previousFishImages = {
  guppy: 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=85',
};

function mergeFishDefaults(savedItem) {
  const defaultFish = fishList.find((item) => item.id === savedItem?.id);
  if (!defaultFish) return savedItem;
  return {
    ...defaultFish,
    ...savedItem,
    image: savedItem.image === previousFishImages[savedItem.id] ? defaultFish.image : savedItem.image,
  };
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Máy chủ chưa thể xử lý yêu cầu.');
  return data;
}

async function saveRemoteFavorites(fishIds) {
  const { fishIds: savedIds } = await apiRequest('/api/favorites', {
    method: 'PUT',
    body: JSON.stringify({ fishIds }),
  });
  return savedIds;
}

function loadFavorites(user) {
  if (user?.role !== 'customer') return [];
  try {
    const saved = JSON.parse(localStorage.getItem(favoritesKey(user)));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function favoritesKey(user) {
  return `aqua-atlas-favorites:${user.email}`;
}

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLocaleLowerCase('vi');
}
