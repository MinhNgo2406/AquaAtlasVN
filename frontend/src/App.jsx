import { lazy, Suspense, useEffect, useState } from 'react';
import { apiRequest } from './api.js';
import CareSection from './components/CareSection.jsx';
import CustomerWorkspace from './components/CustomerWorkspace.jsx';
const AdminDashboard = lazy(() => import('./components/AdminDashboard.jsx'));
const AuthPage = lazy(() => import('./components/AuthPage.jsx'));
import FishDetailPage from './components/FishDetailPage.jsx';
import HealthAndShops from './components/HealthAndShops.jsx';
import HeroSection from './components/HeroSection.jsx';
import QuickSearch from './components/QuickSearch.jsx';
import RevealOnScroll from './components/RevealOnScroll.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SpeciesSection from './components/SpeciesSection.jsx';
import fishList from './data/fish.js';
import shopList from './data/shops.js';

export default function App() {
  const [themeMode, setThemeMode] = useState(() => {
    try { return localStorage.getItem('aqua-atlas-theme') || 'light'; } catch { return 'light'; }
  });
  const [fish, setFish] = useState(loadFish);
  const [shops, setShops] = useState(shopList);
  const [apiReady, setApiReady] = useState(false);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [family, setFamily] = useState('all');
  const [level, setLevel] = useState('all');
  const [tankSize, setTankSize] = useState('all');
  const [temperament, setTemperament] = useState('all');
  const [compatibility, setCompatibility] = useState('all');
  const [compareIds, setCompareIds] = useState([]);
  const [activeFishId, setActiveFishId] = useState(() => new URLSearchParams(window.location.search).get('fish'));
  const [isAdminPage, setIsAdminPage] = useState(() => new URLSearchParams(window.location.search).get('admin') === '1');
  const [isAuthPage, setIsAuthPage] = useState(() => new URLSearchParams(window.location.search).get('auth') === '1');
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const activeFish = fish.find((item) => item.id === activeFishId);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeMode === 'dark' ? '#101b19' : '#f5f8f4');
    try { localStorage.setItem('aqua-atlas-theme', themeMode); } catch { /* The selected theme still applies for this page view. */ }
  }, [themeMode]);

  function toggleTheme() {
    setThemeMode((mode) => mode === 'dark' ? 'light' : 'dark');
  }

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
    apiRequest('/api/shops')
      .then((items) => { if (active && Array.isArray(items)) setShops(items); })
      .catch(() => { if (active) setShops(shopList); });
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
    const matchesFamily = family === 'all' || item.family === family;
    const matchesLevel = level === 'all' || item.level === level;
    const matchesTank = tankSize === 'all' || Number(item.minTankLiters) <= Number(tankSize);
    const matchesTemperament = temperament === 'all' || item.temperament === temperament;
    const matchesCompatibility = compatibility === 'all' || item.compatibilityGroup === compatibility;
    const matchesFavorite = !showFavorites || favorites.includes(item.id);
    return matchesName && matchesGroup && matchesFamily && matchesLevel && matchesTank && matchesTemperament && matchesCompatibility && matchesFavorite;
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
    setFamily('all');
    setLevel('all');
    setTankSize('all');
    setTemperament('all');
    setCompatibility('all');
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

  async function saveShop(shop) {
    const { shop: savedShop } = await apiRequest('/api/admin/shops', {
      method: 'PUT',
      body: JSON.stringify(shop),
    });
    setShops((current) => (current.some((item) => item.id === savedShop.id)
      ? current.map((item) => item.id === savedShop.id ? savedShop : item)
      : [...current, savedShop]).filter((item) => item.isActive !== false));
    return savedShop;
  }

  async function setShopActive(id, isActive) {
    const { shop: updatedShop } = await apiRequest(`/api/admin/shops/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
    setShops((current) => current.map((item) => item.id === id ? updatedShop : item).filter((item) => item.isActive !== false));
  }

  if (isAuthPage || (isAdminPage && user?.role !== 'admin')) {
    return (
      <Suspense fallback={<div className="app-loading" role="status">Đang tải trang đăng nhập…</div>}>
        <AuthPage themeMode={themeMode} onToggleTheme={toggleTheme} onSuccess={finishLogin} onExit={goHome} />
      </Suspense>
    );
  }

  if (isAdminPage && user?.role === 'admin') {
    return (
      <Suspense fallback={<div className="app-loading" role="status">Đang tải dashboard…</div>}>
        <AdminDashboard
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
          fish={fish}
          shops={shops}
          onSaveFish={saveFish}
          onDeleteFish={deleteFish}
          onSaveShop={saveShop}
          onSetShopActive={setShopActive}
          onExit={goHome}
          onLogout={logout}
          user={user}
        />
      </Suspense>
    );
  }

  return (
    <>
      <SiteHeader compact={Boolean(activeFish)} themeMode={themeMode} onToggleTheme={toggleTheme} onHome={goHome} user={user} onLogin={showLogin} onLogout={logout} />
      {activeFish ? (
        <main><FishDetailPage fish={activeFish} onBack={goHome} user={user} /></main>
      ) : (
        <main>
          <HeroSection />
          <QuickSearch
            query={query}
            group={group}
            family={family}
            level={level}
            tankSize={tankSize}
            temperament={temperament}
            compatibility={compatibility}
            onQueryChange={setQuery}
            onGroupChange={setGroup}
            onFamilyChange={setFamily}
            onLevelChange={setLevel}
            onTankSizeChange={setTankSize}
            onTemperamentChange={setTemperament}
            onCompatibilityChange={setCompatibility}
          />
          <RevealOnScroll>
          <SpeciesSection
            fish={visibleFish}
            user={user}
            favorites={favorites}
            showFavorites={showFavorites}
            compareIds={compareIds}
            allFish={fish}
            onToggleCompare={(id) => setCompareIds((current) => current.includes(id)
              ? current.filter((item) => item !== id)
              : current.length < 3 ? [...current, id] : current)}
            onClearCompare={() => setCompareIds([])}
            onSelectFish={openFish}
            onToggleFavorite={toggleFavorite}
            onToggleFavoriteView={toggleFavoritesView}
          />
          </RevealOnScroll>
          <RevealOnScroll><CustomerWorkspace fish={fish} user={user} /></RevealOnScroll>
          <RevealOnScroll><CareSection /></RevealOnScroll>
          <RevealOnScroll><HealthAndShops user={user} shops={shops} /></RevealOnScroll>
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
