# Shashi Kant · Portfolio

I’m a full-stack developer. I built this portfolio around an interactive map of India, with stops in the cities where I’ve studied and worked. It also brings together my work experience and personal projects.

[View the portfolio](https://kt-shashi.github.io/)

## Run locally

With Node.js 24.15.0 or a newer 24.x release installed, run:

```sh
npm ci
npm start
```

Open [localhost:4200](http://localhost:4200).

## Build and test

```sh
npm test
npm run build
```

The site is built with Angular, TypeScript, and SCSS. The production build goes to `dist/shashi-portfolio/browser` and is deployed to GitHub Pages when changes land on `main`.

Portfolio content lives in [portfolio.data.ts](src/app/data/portfolio.data.ts). See [Map data](MAP_DATA.md) for sources and instructions on regenerating the map.
