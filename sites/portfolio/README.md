# Portfolio

The portfolio that presents every project in this repo. Nothing is hard-coded to a number of projects: headlines, stats, numbering, filters, the exhibition's rooms and the live desk all derive from one list.

| Route | Page |
|---|---|
| `/` | Portfolio index (list / grid, tag filters) |
| `/work/:id` | Case study |
| `/exhibition` | Standalone gallery presentation |
| `/live` | Standalone "live sites" presentation |

## Adding a project

1. **Add an entry** to `ENTRIES` in `src/data/projects.ts`. Order in the list is the order on the site, and numbering (`01`, `02`, …) follows it automatically. Required fields:
   - `id` becomes the URL, `/work/<id>`
   - `name`, `noun` (for example "a bike shop", used in generated copy), `kind`, `tagline`, `summary`, `year`, `url`
   - `hero` and `detail` screenshot paths (`/shots/<id>-hero.webp`, `/shots/<id>-detail.webp`)
   - `palette` (`bg`, `fg`, `accent`) colours the page when the project is hovered, and colours its case study
   - `medium`, `signature`, `scope`, `challenge`, `approach` (the case-study content)
   - `tags` from the shared `TAGS` vocabulary, which drives the filters (add a new tag to `TAGS` if needed)
   - `images`, the number of generated images, which feeds the stats
   - `capture` (optional): `{ selector, detail }`, telling the screenshot tool what to scroll (`'doc'` means the whole page) and where to take the detail frame (0–1)
2. **Capture screenshots** while the project's dev server is running:
   ```bash
   node tools/capture.mjs <id>
   ```
   Run `node tools/capture.mjs` with no ids to refresh every project.
3. That's all. The index switches from list to grid view by default once there are more than 8 projects.

## Checking layouts at scale

In development, add `?stress=24` to any URL to pad the list with clones (up to 60). The setting lasts for the browser session. Use `?stress=0` to turn it off.

```bash
node tools/stress-shots.mjs 24     # screenshots of every page with 24 projects
node tools/portfolio-e2e.mjs       # routes and navigation smoke test
```

## Services and contact

- Packages, prices and the care plan live in `src/data/services.ts`.
- `OWNER.email` and `OWNER.booking` (a Cal.com or Calendly link) live in `src/data/projects.ts`. The "Book a call" button is hidden while `booking` is empty.
- The contact form posts JSON to `VITE_CONTACT_ENDPOINT` when it is set (for example a Formspree form URL, configured as a Vercel environment variable). Without it, the form opens the visitor's mail app with the message filled in.
- Form logic tests: `node --test tools/contact.test.mjs`. Flow tests: `node tools/portfolio-e2e.mjs`.
