import { create } from 'zustand';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hintSeenInitial =
  typeof window !== 'undefined' && (() => {
    try { return localStorage.getItem('museum-hint-seen') === '1'; } catch (e) { return false; }
  })();

const useMuseumStore = create((set, get) => ({
  // Scene state
  scene: 'hero', // 'hero' | 'entering' | 'hall'
  setScene: (scene) => set({ scene }),

  // Door animation progress (0 = closed, 1 = fully open)
  doorProgress: 0,
  setDoorProgress: (doorProgress) => set({ doorProgress }),

  // Current view in the hall
  hallView: 'panoramic', // 'panoramic' | 'left' | 'center' | 'right'
  setHallView: (hallView) => set({ hallView }),

  // Active exhibit (for zoom / modal)
  activeExhibit: null,
  setActiveExhibit: (activeExhibit) => set({ activeExhibit }),

  // Story card open
  storyOpen: false,
  setStoryOpen: (storyOpen) => set({ storyOpen }),

  // Bench mode
  benchActive: false,
  setBenchActive: (benchActive) => set({ benchActive }),

  // Exhibit index / directory overlay
  indexOpen: false,
  setIndexOpen: (indexOpen) => set({ indexOpen }),

  // Camera target (for smooth transitions)
  cameraTarget: { x: 0, y: 1.6, z: 5 },
  cameraLookAt: { x: 0, y: 1.5, z: 0 },
  setCameraTarget: (pos, lookAt) => set({ cameraTarget: pos, cameraLookAt: lookAt }),

  // Hover state for frames
  hoveredFrame: null,
  setHoveredFrame: (hoveredFrame) => set({ hoveredFrame }),

  // Mobile detection
  isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
  setIsMobile: (isMobile) => set({ isMobile }),

  // Accessibility — reduce/disable non-essential motion
  reducedMotion: prefersReducedMotion,
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),

  // First-visit discoverability hint
  hintSeen: hintSeenInitial,
  dismissHint: () => {
    try { localStorage.setItem('museum-hint-seen', '1'); } catch (e) {}
    set({ hintSeen: true });
  },

  // Sound
  soundEnabled: false,
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

  // Tour mode
  tourActive: false,
  setTourActive: (tourActive) => set({ tourActive }),

  // Theme
  theme: 'starryNight', // 'starryNight' | 'klimt' | 'monet' | 'creation' | 'lastSupper'
  setTheme: (theme) => set({ theme }),

  // Jump straight into the hall (used by deep-links and skip-intro)
  enterHall: () => set({ scene: 'hall', doorProgress: 1 }),

  // Close all overlays
  closeAll: () => set({
    activeExhibit: null,
    storyOpen: false,
    benchActive: false,
    tourActive: false,
    indexOpen: false,
  }),
}));

export default useMuseumStore;
