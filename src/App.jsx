import { useEffect, useState } from 'react';
import CareSection from './components/CareSection.jsx';
import FishDetailPage from './components/FishDetailPage.jsx';
import HealthAndShops from './components/HealthAndShops.jsx';
import HeroSection from './components/HeroSection.jsx';
import QuickSearch from './components/QuickSearch.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SpeciesSection from './components/SpeciesSection.jsx';
import fishList from './data/fish.js';

export default function App() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [level, setLevel] = useState('all');
  const [activeFishId, setActiveFishId] = useState(() => new URLSearchParams(window.location.search).get('fish'));
  const activeFish = fishList.find((fish) => fish.id === activeFishId);

  useEffect(() => {
    function syncFishFromUrl() {
      setActiveFishId(new URLSearchParams(window.location.search).get('fish'));
    }

    window.addEventListener('popstate', syncFishFromUrl);
    return () => window.removeEventListener('popstate', syncFishFromUrl);
  }, []);

  useEffect(() => {
    document.title = activeFish
      ? `${activeFish.name} — AquaAtlas Vietnam`
      : 'AquaAtlas Vietnam — Cẩm nang cá cảnh';
  }, [activeFish]);

  const normalizedQuery = normalize(query);
  const visibleFish = fishList.filter((fish) => {
    const matchesName = !normalizedQuery || normalize(`${fish.name} ${fish.scientificName}`).includes(normalizedQuery);
    const matchesGroup = group === 'all' || fish.group === group;
    const matchesLevel = level === 'all' || fish.level === level;
    return matchesName && matchesGroup && matchesLevel;
  });

  function openFish(fish) {
    window.history.pushState({}, '', `?fish=${encodeURIComponent(fish.id)}`);
    setActiveFishId(fish.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goHome() {
    window.history.pushState({}, '', window.location.pathname);
    setActiveFishId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <SiteHeader compact={Boolean(activeFish)} onHome={goHome} />
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
          <SpeciesSection fish={visibleFish} onSelectFish={openFish} />
          <CareSection />
          <HealthAndShops />
        </main>
      )}
      <SiteFooter />
    </>
  );
}

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLocaleLowerCase('vi');
}
