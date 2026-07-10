<div align="center">

# 🏛️ Museum of Failures

### _An immersive 3D exhibition where professional failures are framed in gold._

> _"Your failures are not your identity. They are your expensive tutors."_

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r184-000000?style=flat-square&logo=three.js)](https://threejs.org)
[![React Three Fiber](https://img.shields.io/badge/R3F-9-black?style=flat-square)](https://r3f.docs.pmnd.rs)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Zustand](https://img.shields.io/badge/Zustand-5-433?style=flat-square)](https://zustand.docs.pmnd.rs)

</div>

---

## The Concept

LinkedIn is a museum of victories — polished milestones, curated wins, humble brags.

**This is the other museum.** The one nobody builds. It shows the ghosted invoices, the launches nobody saw, the partnerships that dissolved, the burnout sprints, and the pitches that fell flat.

Walk through baroque doors into a candlelit hall and explore **12 ornate paintings** — each one a real failure from a freelancer/founder journey (2019–2025), with the story, the mistakes, and the hard-earned lesson. Because the people worth hiring aren't the ones who never failed. They're the ones who **framed their failures in gold** and kept walking.

---

## ✨ Experience Highlights

| | Feature |
|---|---|
| 🚪 | **Cinematic entrance** — bronze museum doors that open on scroll _or_ a one-click **"Enter the Museum"** button |
| 🖼️ | **12 interactive exhibits** — hover to glow, click to read; each frame carries an **engraved brass nameplate** (numeral · year + title) |
| 🗂️ | **The Collection** — a full index of all 12 failures; click any card to walk the camera to that wall and open it |
| 🎨 | **5 art themes** — Van Gogh, Klimt, Monet, Michelangelo, Da Vinci — each restyles the walls, lighting, and atmosphere, previewed with real painting thumbnails |
| 💌 | **The Curator's Letter** — a personal note on the central bench |
| 🔗 | **Deep-linkable** — every exhibit has its own URL (`/#exhibit-5`); share or bookmark a specific failure |
| 📤 | **Share cards** — auto-generated 1200×630 image + native share sheet, X, LinkedIn, and copy-link |
| 🎧 | **Ambient soundscape** — a procedurally generated drone + sparkle score (Web Audio) |
| 🧭 | **Auto-tour mode** — hands-free camera pan across the halls (press `T`) |
| ♿ | **Accessibility** — respects `prefers-reduced-motion`, keyboard navigation, focus states, high-contrast text |

---

## 🎨 The 12 Exhibits

| # | Year | Title | The Lesson |
|:-:|:----:|-------|------------|
| I | 2019 | The Ghosted Invoice | Contracts aren't optional — they're survival gear |
| II | 2020 | The Feature Nobody Used | Build from research, not assumption |
| III | 2021 | The Startup That Drowned | Validate before you build |
| IV | 2021 | The Rebrand That Confused | Evolution, not revolution |
| V | 2022 | The Client I Lost in a Day | 48 hours of silence can cost €12,000 |
| VI | 2023 | When Perfectionism Paralysed | Shipping beats perfection — every time |
| VII | 2024 | The Team That Imploded | Culture fit is the foundation, not a buzzword |
| VIII | 2022 | The Partnership That Dissolved | Handshakes aren't contracts |
| IX | 2023 | The Burnout Sprint | Greed disguised as ambition will break you |
| X | 2024 | The Launch That Nobody Saw | Build in public or build in vain |
| XI | 2024 | The Pitch That Fell Flat | Confidence without preparation is arrogance |
| XII | 2025 | The Scope That Swallowed Me | Scope creep is a slow death without change control |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **UI** | React 19 | Component architecture for modular scenes |
| **3D Engine** | Three.js r184 + React Three Fiber 9 | Declarative WebGL rendering |
| **3D Helpers** | React Three Drei 10 | Camera, controls, abstractions |
| **State** | Zustand 5 | Lightweight reactive store across scenes, camera, overlays |
| **Styling** | Tailwind CSS 4 | Overlays, modals, responsive layouts |
| **Animation** | Framer Motion + GSAP + `useFrame` | Modals, doors, cameras, particles |
| **Type** | Fraunces · Playfair Display · IM Fell · Poppins | Editorial serif display + clean sans body |
| **Build** | Vite 8 | Instant HMR, optimized static builds |

---

## 🧠 Engineering Highlights

- **Procedurally generated art** — walls, gold frames, floor tiles, painting canvases, and engraved nameplates are all drawn in code via the Canvas API. Minimal image assets.
- **Custom SVG icon system** — one professional line icon per exhibit, rendered both as React components and drawn onto 3D canvas textures so the paintings, index, and share cards stay in sync.
- **Scroll-to-3D bridge** — continuous real-time mapping of scroll/touch input to door rotation with eased interpolation.
- **Multi-target camera controller** — smooth `lerp` transitions between panoramic, per-wall, and bench views.
- **Live theme engine** — switching themes lerps every wall material, light, fog, and background color in real time.
- **Reduced-motion aware** — particle drift, breathing, and camera bob gracefully disable for motion-sensitive users.
- **WebGL context recovery** — the scene restores instead of freezing after a lost GPU context.

---

## 🚀 Getting Started

```bash
# Install
npm install

# Dev server (http://localhost:5173)
npm run dev

# Production build → dist/
npm run build

# Preview the production build
npm run preview
```

---

## 🌐 Deployment

This is a fully static site — deploy the `dist/` folder anywhere:

- **Netlify / Vercel / Cloudflare Pages** — connect the repo or drag-drop `dist/`. Zero config.
- **cPanel / any static host** — upload the contents of `dist/` to `public_html`. Routing uses hash URLs, so no `.htaccess` rewrites are needed.
- **Subfolder deploys** — set `base: '/your-subfolder/'` in `vite.config.js` before building.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Experience.jsx        # R3F <Canvas> root
│   ├── DoorScene.jsx         # Entrance doors
│   ├── MuseumHall.jsx        # Walls, floor, lighting, theme engine
│   ├── PaintingFrame.jsx     # Interactive gold frame + nameplate
│   ├── CameraController.jsx  # Multi-view camera lerp
│   ├── Bench.jsx · Particles.jsx · Lighting.jsx
│   └── UI/                   # Hero, Navigation, Index, Overlays, ShareCard, ThemePicker…
├── data/
│   ├── exhibits.js           # The 12 stories
│   └── icons.jsx             # SVG icon set (React + canvas)
├── store/useMuseumStore.js   # Zustand state
├── themes/index.js           # 5 art themes
└── utils/textures.js         # Procedural canvas textures
```

---

## The Philosophy

Most portfolios say: _"Look what I built."_ This one says: _"Look what broke me — and what I built from the wreckage."_

Every seasoned builder has a museum like this. Most keep the doors locked. **This one is open.**

---

<div align="center">

_Built with React, Three.js, and an uncomfortable amount of honesty._

**[Deepanshu Verma](https://github.com/deepanshuvermaa)**

</div>
