import React, { useEffect } from 'react';
import Experience from './components/Experience';
import HeroOverlay from './components/UI/HeroOverlay';
import Navigation from './components/UI/Navigation';
import ExhibitOverlay from './components/UI/ExhibitOverlay';
import ExhibitIndex from './components/UI/ExhibitIndex';
import HallHint from './components/UI/HallHint';
import StoryCard from './components/UI/StoryCard';
import BenchLetter from './components/UI/BenchLetter';
import SoundManager from './components/UI/SoundManager';
import TourMode from './components/UI/TourMode';
import ThemePicker from './components/UI/ThemePicker';
import useMuseumStore from './store/useMuseumStore';
import { EXHIBITS } from './data/exhibits';

function Vignette() {
  const scene = useMuseumStore(s => s.scene);
  if (scene !== 'hall') return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 2,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.2) 100%)',
      }}
    />
  );
}

const exhibitFromHash = () => {
  const m = window.location.hash.match(/exhibit-(\d+)/);
  if (!m) return null;
  const idx = parseInt(m[1], 10) - 1;
  return EXHIBITS[idx] || null;
};

export default function App() {
  // Track mobile state on resize
  useEffect(() => {
    const check = () => {
      useMuseumStore.getState().setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Keep reduced-motion preference live (user can toggle it at the OS level)
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => useMuseumStore.getState().setReducedMotion(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  // Load saved theme from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('museum-theme');
      if (saved && ['starryNight', 'klimt', 'monet', 'creation', 'lastSupper'].includes(saved)) {
        useMuseumStore.getState().setTheme(saved);
      }
    } catch (e) {}
  }, []);

  // Deep-link: if the URL points at an exhibit, skip the intro and open it.
  useEffect(() => {
    const ex = exhibitFromHash();
    if (ex) {
      const s = useMuseumStore.getState();
      s.enterHall();
      s.setHallView(ex.wall === 'left' ? 'left' : ex.wall === 'right' ? 'right' : 'center');
      s.setActiveExhibit(ex);
      s.dismissHint();
    }
  }, []);

  // Back/forward buttons sync with the open exhibit.
  useEffect(() => {
    const onPop = () => {
      const s = useMuseumStore.getState();
      if (s.scene !== 'hall') return;
      s.setActiveExhibit(exhibitFromHash());
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Keep the URL in step with the open exhibit so any view is shareable.
  const activeExhibit = useMuseumStore(s => s.activeExhibit);
  const scene = useMuseumStore(s => s.scene);
  useEffect(() => {
    if (scene !== 'hall') return;
    const desired = activeExhibit ? `#exhibit-${activeExhibit.id + 1}` : '';
    const current = window.location.hash;
    if (desired !== current) {
      window.history.replaceState(null, '', desired || `${window.location.pathname}${window.location.search}`);
    }
  }, [activeExhibit, scene]);

  // Remove the boot splash once React has mounted.
  useEffect(() => {
    const splash = document.getElementById('boot-splash');
    if (!splash) return;
    const id = setTimeout(() => {
      splash.classList.add('hide');
      setTimeout(() => splash.remove(), 700);
    }, 350);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      <Experience />
      <Vignette />
      <HeroOverlay />
      <Navigation />
      <HallHint />
      <ExhibitIndex />
      <ExhibitOverlay />
      <StoryCard />
      <BenchLetter />
      <SoundManager />
      <TourMode />
      <ThemePicker />
    </div>
  );
}
