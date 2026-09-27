# portfolio-sites

Six websites designed and built with AI by Eric Bridoux: five invented brands and the portfolio that presents them. It's an npm-workspaces monorepo of Vite + React + TypeScript apps, and each app deploys as its own Vercel project.

| Site | Folder | What it is |
|---|---|---|
| Portfolio | `sites/portfolio` | Index with case studies, plus standalone `/exhibition` and `/live` presentations |
| Aurèle | `sites/aurele` | Swiss watchmaker: a photographic chronograph dissected in 3D on scroll |
| Ember & Stack | `sites/ember-stack` | Smash-burger restaurant: a photographed burger that comes apart ingredient by ingredient, plus a working cart |
| Kestrel Orbital | `sites/kestrel` | Space tourism: a real-time Three.js launch sequence and seat booking |
| Tōgen | `sites/togen` | Kyoto tea house: Japanese editorial layout and ceremony booking |
| SUBSONIQ | `sites/subsoniq` | Techno festival: neo-brutalist design, variable type, timetable and tickets |

All brands, people and details are fictional. Imagery was generated for these projects.

## Develop

```bash
npm install
npm run dev --workspace aurele        # or ember-stack, kestrel, togen, subsoniq, portfolio
npm run build                         # builds every site
```

Dev ports: portfolio 5100, aurele 5101, ember-stack 5102, kestrel 5103, togen 5104, subsoniq 5105.

## Tools

- `node tools/capture.mjs [id…]` refreshes the portfolio screenshots (needs the site's dev server running)
- `node tools/e2e.mjs` runs smoke tests of every site's forms, cart and booking flows
- `node tools/portfolio-e2e.mjs` runs the portfolio routes and navigation tests
- `node tools/stress-shots.mjs 24` checks portfolio layouts with 24 projects

See `sites/portfolio/README.md` for how to add a project to the portfolio.
