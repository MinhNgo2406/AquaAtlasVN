import { useState } from 'react';
import CareSection from './components/CareSection.jsx';
import HealthAndShops from './components/HealthAndShops.jsx';
import HeroSection from './components/HeroSection.jsx';
import QuickSearch from './components/QuickSearch.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SpeciesSection from './components/SpeciesSection.jsx';
import fishList from './data/fish.js';

export default function App() {
  const [water, setWater] = useState('all');
  const [level, setLevel] = useState('all');

  const visibleFish = fishList.filter((fish) => {
    const matchesWater = water === 'all' || fish.water === water;
    const matchesLevel = level === 'all' || fish.level === level;
    return matchesWater && matchesLevel;
  });

  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <QuickSearch water={water} level={level} onWaterChange={setWater} onLevelChange={setLevel} />
        <SpeciesSection fish={visibleFish} />
        <CareSection />
        <HealthAndShops />
      </main>
      <SiteFooter />
    </>
  );
}
