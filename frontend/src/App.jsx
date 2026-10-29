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
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [level, setLevel] = useState('all');
  const [activeFishId, setActiveFishId] = useState(() => new URLSearchParams(window.location.search).get('fish'));
  const [isAdminPage, setIsAdminPage] = useState(() => new URLSearchParams(window.location.search).get('admin') === '1');
  const [isAuthPage, setIsAuthPage] = useState(() => new URLSearchParams(window.location.search).get('auth') === '1');
  const [user, setUser] = useState(loadSession);
  const [favorites, setFavorites] = useState(() => loadFavorites(loadSession()));
  const [showFavorites, setShowFavorites] = useState(false);
  const activeFish = fish.find((item) => item.id === activeFishId);

  useEffect(() => {
    localStorage.setItem('aqua-atlas-fish', JSON.stringify(fish));
  }, [fish]);

  useEffect(() => {
    if (user?.role === 'customer') {
      localStorage.setItem(favoritesKey(user), JSON.stringify(favorites));
    }
  }, [favorites, user]);

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

  function finishLogin(nextUser) {
    sessionStorage.setItem('aqua-atlas-session', JSON.stringify(nextUser));
    setUser(nextUser);
    const adminLogin = nextUser.role === 'admin';
    let nextFavorites = loadFavorites(nextUser);
    const pendingFishId = sessionStorage.getItem('aqua-atlas-pending-favorite');
    if (nextUser.role === 'customer' && pendingFishId && !nextFavorites.includes(pendingFishId)) {
      nextFavorites = [...nextFavorites, pendingFishId];
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

  function logout() {
    sessionStorage.removeItem('aqua-atlas-session');
    setUser(null);
    setFavorites([]);
    setShowFavorites(false);
    showLogin();
  }

  function toggleFavorite(id) {
    if (user?.role !== 'customer') {
      sessionStorage.setItem('aqua-atlas-pending-favorite', id);
      showLogin();
      return;
    }
    setFavorites((current) => current.includes(id)
      ? current.filter((favoriteId) => favoriteId !== id)
      : [...current, id]);
  }

  function toggleFavoritesView() {
    setQuery('');
    setGroup('all');
    setLevel('all');
    setShowFavorites((current) => !current);
  }

  function saveFish(updatedFish) {
    setFish((current) => {
      const exists = current.some((item) => item.id === updatedFish.id);
      return exists ? current.map((item) => item.id === updatedFish.id ? updatedFish : item) : [...current, updatedFish];
    });
  }

  function deleteFish(id) {
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
    if (!Array.isArray(savedFish)) return fishList;

    const previousImages = {
      guppy: 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=85',
    };

    return savedFish.map((savedItem) => {
      const defaultFish = fishList.find((item) => item.id === savedItem.id);
      if (!defaultFish) return savedItem;

      return {
        ...defaultFish,
        ...savedItem,
        image: savedItem.image === previousImages[savedItem.id] ? defaultFish.image : savedItem.image,
      };
    });
  } catch {
    return fishList;
  }
}

function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem('aqua-atlas-session'));
  } catch {
    return null;
  }
}

function favoritesKey(user) {
  return `aqua-atlas-favorites:${user.email}`;
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

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLocaleLowerCase('vi');
}
