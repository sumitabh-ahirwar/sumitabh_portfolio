# Sumitabh Ahirwar — Portfolio

Personal portfolio of **Sumitabh Ahirwar**, B.Tech CSE at MNNIT Allahabad (2023–2027): AI systems, distributed ML and full-stack products.

React + Vite single-page site with a WebGL hero, scroll-driven motion, interactive architecture diagrams and a case-study view for each project.

## Quick start

Requires Node.js 18+ (built and tested on Node 24).

```bash
npm install
```

```bash
npm run dev
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (React hooks rules included) |

## Environment variables (optional)

Copy `.env.example` to `.env` if you need it. Never put secrets here — anything prefixed `VITE_` ends up in the browser bundle.

| Variable | Purpose | When empty |
| --- | --- | --- |
| `VITE_SITE_URL` | Your production URL, no trailing slash (e.g. `https://sumitabh.dev`) | No canonical / `og:url` tags are emitted, and `og:image` stays relative |

### Contact section

There is no contact form (nothing to configure, no backend). Visitors get a direct-line panel: **Write in Gmail** opens Gmail's compose window in a new tab with your address filled in — it works in any browser without a desktop mail app. **Copy address** and **Mail app** (`mailto:`) are there as alternatives.

Set the same variables in your hosting dashboard for production builds.

## Editing content

All content lives in `src/data/` — components only read from these files.

| File | Contains |
| --- | --- |
| `profile.js` | Name, headline, email, social links, resume path, education, positions of responsibility, nav items |
| `projects.js` | The three case studies: summary, tech, links, implementation, challenges, outcomes, and the architecture-diagram nodes/edges |
| `skills.js` | Skill groups and which project each skill is used in (drives the filter) |
| `achievements.js` | Contest results and peak ratings (static values from the resume) |

Everything is sourced from the resume and the project READMEs on GitHub. Values are intentionally static — nothing is fetched live.

### Resume

The PDF is served from `public/resume/Sumitabh_Ahirwar.pdf`. To update it, replace that file keeping the same name — or, if you rename it, update `profile.resume.href` in `src/data/profile.js` to match. `npm run dev` warns and `npm run build` fails if the file named there doesn't exist, so a broken download link can't be deployed by accident.

> The current PDF includes your phone number. If you would rather not publish it, upload a version without it.

### Project screenshots

Each project currently shows a coded, clearly-labelled **illustrative** interface. To use real screenshots instead:

1. Put images in `public/projects/<project-id>/` (e.g. `public/projects/researchos/workspace.webp`; ~1760×1120 WebP works well).
2. In `src/data/projects.js`, set `screenshots: [{ src: '/projects/researchos/workspace.webp', alt: 'ResearchOS workspace showing a cited report' }]`.

The card and case study then show the screenshot and drop the "illustrative" label.

### Live demos and links

`links.github` / `links.live` in `projects.js` control the buttons (set to `null` to hide). Verified when this was built:

- GitHub: `Researchos`, `Data2Model`, `jobPortal` repos all exist.
- JobPortal live demo (`jobportal-y0dn.onrender.com`) responds, but the free Render instance needs ~40s to wake up — the site says so next to the link.
- ResearchOS and Data2Model have no public demo; add one to `links.live` when available.

### Profile photo

The current design doesn't use a photo.

## Design & engineering notes

- **Identity — "signal lattice".** Deep navy-black surfaces, icy cyan as the lead accent, electric blue in support, and violet used sparingly. Type is Space Grotesk with JetBrains Mono for labels and metadata. Recurring signatures: the hairline with a travelling pulse in section headers, and the scan band that sweeps the hero lattice.
- **Hero.** A procedural 3D lattice (custom GLSL: nodes, links, GPU-computed signal particles, two orbit rings, distant dust) built with vanilla Three.js. It's lazy-loaded in its own chunk after the intro, once the browser is idle. Rendering pauses off-screen and in background tabs, low-power devices get fewer nodes and 30 fps, and everything is disposed on unmount. Without WebGL, the same lattice is drawn once on a 2D canvas (preview it with `?webgl=0`).
- **Motion.** GSAP drives the loader, hero timeline and scrubbed effects (project preview un-masking, skills tilt, About lead lighting up). Simple reveals use IntersectionObserver + CSS keyframes (`src/styles/reveal.css`) rather than one ScrollTrigger per element. Lenis provides smooth scrolling on GSAP's ticker. Motion tokens live in `src/styles/tokens.css` and `src/lib/motion.js`.
- **Reduced motion.** With `prefers-reduced-motion`, there is no loader, no smooth scrolling and no reveals; the WebGL scene renders still frames only. Content is never hidden by an animation that fails to run.
- **Navigation.** Section links update the URL hash, so refresh returns to the same place. `#case-<id>` deep-links straight into a case study. The nav highlights the active section and hides on scroll-down / shows on scroll-up. There is also a focus-trapped mobile menu.
- **Case studies.** Lazy-loaded dialog: Escape closes, ←/→ switch projects, focus is trapped and restored, and page scroll is locked.
- **Architecture explorer.** Data-driven SVG diagrams (`SystemDiagram.jsx`). The layout is horizontal on wide screens and vertical on phones. Nodes are keyboard-operable (arrows + Enter), and packet animations pause off-screen.
- **Performance.** Sections below the hero mount one per idle slot behind the loader, so no single task lays out the whole page. Decorative animation pauses off-screen, and fonts are self-hosted via Fontsource.

### Measured Lighthouse (local production build, Oct 2026)

| | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Desktop preset | 97 | 99 | 100 | 100 |
| Mobile (simulated 4× CPU throttling, software WebGL) | 63 | 99 | 100 | 100 |

The mobile score is pessimistic: headless Lighthouse renders WebGL in software (SwiftShader), so GPU work shows up as main-thread time. Expect different numbers on a real deployment — re-run Lighthouse against your live URL.

## Deployment

The output is a static site in `dist/`, and navigation is hash-based, so no rewrite rules are needed. `public/404.html` is used by hosts that support it.

**Vercel:** import the GitHub repo → Framework preset **Vite** → build command `npm run build`, output directory `dist` → add any environment variables → Deploy.

**Cloudflare Pages:** Workers & Pages → Create → Pages → connect the repo → build command `npm run build`, output directory `dist` → add environment variables → Save and deploy.

After the first deploy, set `VITE_SITE_URL` to the final domain and redeploy, so canonical and social-preview URLs are absolute.

## Project structure

```
src/
  App.jsx                 page composition, case-study state, progressive mounting
  data/                   all content (see above)
  components/
    layout/               Navbar, Footer, PageLoader
    sections/             Hero, About, Projects, Architecture, Skills, Achievements, Education, Contact
    projects/             ProjectCard, ProjectDetails (lazy), SystemDiagram, previews/
    effects/              HeroScene, NeuralField (WebGL), FieldFallback, shaders, SignalScope, CursorLight
    ui/                   Button, SplitText, SectionHead, Counter, Icons
  hooks/                  media queries, in-view, magnetic hover, section reveals
  lib/                    motion tokens, smooth scroll, navigation, focus trap, lattice generator
  styles/                 tokens, base, reveal, effects
public/                   favicon, og-image, apple-touch-icon, resume, 404, robots.txt
```

## Credits

Creative and technical direction were informed by studying [DineshS36/portfolio](https://github.com/DineshS36/portfolio) (Apache-2.0). Techniques studied there include Lenis synced to GSAP's ticker, pausing WebGL off-screen, adaptive render quality and lazy case studies. The code, visual identity and content here are original.
