# Shashi Kant — portfolio

An Angular 22 portfolio with a geographic journey through India, work experience, personal projects, grouped skills, expandable hobbies, and email contact. Built with standalone components, TypeScript, SCSS, and a locally hosted Manrope font. No backend, map API key, analytics, or external font requests.

## Setup and development

Use Node.js 24.15.0 or a newer compatible Node 24 release and npm. Dependencies are locked in `package-lock.json`. A project-local Node 24 runtime is also included as a development dependency for this workspace.

```sh
npm ci
npm start
```

Open the Local URL printed by Angular, normally http://localhost:4200. Keep the terminal running. If an old development process holds port 4200, stop that process before restarting; alternatively use `npm start -- --port 4201`.

## Checks and production build

```sh
npm run typecheck
npm test
npm run build
```

`npm run test:watch` runs interactive unit tests. Build output is `dist/shashi-portfolio/browser`, suitable for static hosting. No production hosting or canonical URL is configured.

## Editing

- `src/app/data/portfolio.data.ts`: identity, supplied URLs, work, projects, skills, education, hobbies, city coordinates and label offsets.
- `src/app/app.html` and `app.scss`: page sections and responsive composition.
- `src/app/journey.*`: map controls, selection, detail panel and education list.
- `src/styles.scss`: colors, typography, spacing and reduced-motion rules.
- `src/index.html`: professional title and description. Keep metadata aligned with content edits.

Map coordinates are longitude/latitude. Never move city coordinates to resolve label collisions: change the separate label offsets instead. See [MAP_DATA.md](MAP_DATA.md) for provenance, projection and regeneration. The gaming alias is rendered only while its hobby disclosure is open.

## Validation status and remaining work

The production build and four focused unit tests passed during initial implementation. The page subsequently loaded successfully in the in-app browser after a stalled development server was replaced. The production build currently reports a component stylesheet size warning (about 6 KB versus the 4 KB warning threshold).

A complete desktop/tablet/mobile visual and accessibility audit remains pending. City markers open a floating detail panel positioned within the viewport. No end-to-end runner is configured, and no full browser-console, touch-device, or screen-reader audit is claimed.
