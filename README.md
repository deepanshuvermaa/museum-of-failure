# Museum of Failures

> _"Your failures are not your identity. They are your expensive tutors."_

An immersive 3D interactive museum built entirely on the web — where professional failures are not hidden, but framed in gold and displayed with pride.

Walk through baroque doors, explore a candlelit exhibition hall, and click on 12 ornate paintings — each one a real failure from my journey as a freelancer, builder, and entrepreneur (2019–2025). No fluff. No filters. Just honest stories, hard lessons, and the receipts.

---

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r184-black?style=flat-square&logo=three.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=flat-square&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=flat-square)

---

## The Concept

LinkedIn is a museum of victories. Polished milestones, curated wins, humble brags.

**This is the other museum.**

The one nobody builds. The one that shows the ghosted invoices, the launches nobody saw, the partnerships that dissolved, the burnout sprints, and the pitches that fell flat. Each exhibit is a real story — with a timeline, a list of mistakes, and 3 hard-earned lessons.

Because the people worth hiring aren't the ones who never failed. They're the ones who **framed their failures in gold** and kept walking.

---

## What's Inside

### The Experience

| Scene | Description |
|-------|-------------|
| **The Entrance** | Ornate bronze museum doors that open as you scroll — stone columns, golden lanterns, a starry night sky behind the threshold |
| **The Hall** | A 3D exhibition room with polished reflective floors, baroque gold-framed paintings on three walls, floating particles, and cinematic teal-orange lighting |
| **The Exhibits** | 12 interactive paintings — hover to see them glow, click to read the story of each failure |
| **The Bench & Letter** | A wooden bench at the center holds a personal letter from the curator to every visitor |

### The 12 Exhibits

| # | Year | Title | One-Line Lesson |
|---|------|-------|-----------------|
| I | 2019 | The Ghosted Invoice | Contracts aren't optional — they're survival gear |
| II | 2020 | The Feature Nobody Used | Build from research, not assumption |
| III | 2021 | The Startup That Drowned | Validate before you build |
| IV | 2021 | The Rebrand That Confused | Evolution, not revolution |
| V | 2022 | The Client I Lost in a Day | 48 hours of silence can cost you €12,000 |
| VI | 2023 | When Perfectionism Paralysed | Shipping beats perfection — every time |
| VII | 2024 | The Team That Imploded | Culture fit isn't a buzzword — it's the foundation |
| VIII | 2022 | The Partnership That Dissolved | Handshakes aren't contracts |
| IX | 2023 | The Burnout Sprint | Greed disguised as ambition will break you |
| X | 2024 | The Launch That Nobody Saw | Build in public or build in vain |
| XI | 2024 | The Pitch That Fell Flat | Confidence without preparation is arrogance |
| XII | 2025 | The Scope That Swallowed Me | Scope creep is a slow death without change control |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **UI Framework** | React 19 | Component architecture for modular scene management |
| **3D Engine** | Three.js r184 + React Three Fiber 9 | WebGL-powered 3D rendering with React's declarative model |
| **3D Utilities** | React Three Drei 10 | Higher-level abstractions for camera, lighting, and controls |
| **State Management** | Zustand 5 | Lightweight reactive state across scenes, camera, modals, and interactions |
| **Styling** | Tailwind CSS 4 | Rapid UI styling for overlays, modals, and responsive layouts |
| **Animation** | GSAP 3 + useFrame loops | Smooth tweening for doors, cameras, particles, and hover effects |
| **Build Tool** | Vite 8 | Lightning-fast HMR and optimized production builds |
| **Textures** | Canvas API (procedural) | Every texture — starry night walls, gold frames, floor tiles, paintings — is generated in code. Zero image assets. |

---

## Technical Highlights

- **1,800+ procedurally generated 3D meshes** — every frame has ~150 meshes (baroque borders, corner ornaments, bead moldings, spotlights, nameplates)
- **Procedural texture generation** — a 2048x2048 Starry Night-inspired canvas texture with swirls, brush strokes, star bursts, and a crescent moon — all drawn with math
- **500-particle floating system** — individual physics per particle with sine/cosine oscillation and vertical drift
- **12+ dynamic light sources** — hemisphere, ambient, point, and spot lights with cinematic teal-orange color grading
- **Scroll-to-3D bridge** — continuous real-time mapping of scroll/touch input to 3D door rotation with smooth easing
- **Multi-target camera controller** — 5 predefined views with smooth lerp interpolation for cinematic camera movement
- **Complex material system** — MeshStandardMaterial, MeshPhysicalMaterial with clearcoat (mirror floors), emissive textures, and metallic gold at 0.85+ metalness
- **Zero external assets** — no images, no 3D models, no CDN dependencies. Everything is code.
- **Touch & mobile ready** — full gesture support with responsive canvas rendering

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/museum-of-failures.git

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

---

## The Philosophy

Most portfolios say: _"Look what I built."_

This one says: _"Look what broke me — and what I built from the wreckage."_

Every senior developer, every seasoned founder, every battle-tested freelancer has a museum like this. Most of them just keep the doors locked. This one is open.

---

## Who This Is For

- **Hirers** looking for engineers who've been through the fire — not just the ones with clean GitHub graphs
- **Builders** who need a reminder that failure is the curriculum, not the dropout
- **Anyone** who's ever had a launch nobody saw, a client who ghosted, or a project that ate them alive

---

> _"Visit the Museum of Glory when you're ready for the highlight reel. But this? This is where the real story lives."_

---

Built with React, Three.js, and an uncomfortable amount of honesty.
