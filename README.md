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
- `src/app/app.routes.ts`: section paths, navigation labels, page titles and lazy-loaded components. Journey is the default. Hash URLs such as `/#/projects` support refresh and browser history on static hosts without rewrite rules.
- `src/app/app.*`: the shared shell, scrollable main panel, and focus handling when a page changes.
- `src/app/navigation/`: persistent right navigation on desktop and compact top navigation on smaller screens.
- `src/app/pages/`: standalone Work, Projects, Skills, Education, About and Contact components, each with its own template and styles.
- `src/app/journey.*`: map controls, selection and city popups. Kolkata and Jamshedpur share their qualification data with the Education page.
- `src/styles.scss`: colors, typography, spacing and reduced-motion rules.
- `src/index.html`: professional title and description. Keep metadata aligned with content edits.

Map coordinates are longitude/latitude. Never move city coordinates to resolve label collisions: change the separate label offsets instead. See [MAP_DATA.md](MAP_DATA.md) for provenance, projection and regeneration. The gaming alias is rendered only while its hobby disclosure is open.

## Validation status and remaining work

The unit tests cover section switching, the current navigation link, map controls and links from city popups to the matching Work entry. No end-to-end runner is configured. For manual checks, start at Journey, switch sections from the persistent navigation, follow a city’s experience link, then try Back and refresh on that entry.
