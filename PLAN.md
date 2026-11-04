# Shashi portfolio implementation plan

Prepared on 4 November 2026. This document plans the implementation requested in the brief; application development has not started.

**Workspace findings**

The workspace is empty. There is no existing Angular application, package manifest, or repository configuration to preserve. No applicable `AGENTS.md` was found in the workspace or its ancestor directories. Installed tools are Node.js 24.14.0 and npm 9.6.7.

Angular's official documentation currently lists Angular 22 as the actively supported major version. Its published Node 24 requirement starts at 24.15.0, so runtime compatibility must be resolved before scaffolding. At implementation time, confirm the stable npm distribution tag and its exact engine requirements, select a compatible Node runtime, and lock the Angular CLI, framework, TypeScript, and dependency versions. Do not use a prerelease.

References: [Angular releases](https://angular.dev/reference/releases), [version compatibility](https://angular.dev/reference/versions).

**1. Establish the Angular foundation**

Scaffold the application directly in this workspace using standalone components, TypeScript strict mode, strict template checking, and SCSS. Use a static single-page application with anchor navigation; a router, backend, authentication, database, and UI framework are unnecessary.

Organize the application into a small set of components: site navigation, introduction, journey/map, location details, experience, projects, skills, about/hobbies, and contact. Keep interaction state local to the components that own it, using Angular signals where appropriate.

Create `src/app/data/portfolio.data.ts` with typed identity, contact, navigation, experience, project, skills, education, hobby, and journey records. Journey records include real longitude/latitude coordinates, stable IDs, narrative order, details, coordinate provenance, and links to experience IDs. Separate geographic coordinates from responsive label offsets. All displayed personal content must come from the supplied brief, without inferred achievements or missing-date assignments.

**2. Define the visual system and page composition**

Create SCSS tokens for navy `#101C30`, cream `#F5EBD8`, coral `#F47C6A`, secondary surfaces, readable muted text, spacing, type scale, borders, focus rings, and motion. Check actual text/background contrast before finalizing derived shades. Use one self-hosted variable sans-serif font with its license and sensible system fallbacks; keep font loading small and use `font-display: swap`.

Build a spacious editorial composition with a compact introduction above a nearly full-width map. The map must remain the defining visual, with generous responsive gutters. Use typography, rules, and whitespace to separate sections rather than putting every item inside a card. Use coral selectively for geographic markers and meaningful states.

Keep the order: introduction/journey, work experience, selected projects, skills, about/hobbies, contact. Add a skip link and semantic landmarks. Navigation includes Shashi, section anchors, and “View résumé.” The mobile menu uses a real toggle button, reports expanded state, closes on selection or Escape, and preserves sensible focus. Account for sticky navigation when scrolling to anchors.

**3. Build and validate the geographic map first**

Use Natural Earth's 1:10m Admin 0 countries data, preserving its documented boundary convention. The dataset is public domain; retain source/version information and a small map credit anyway. Optional internal boundaries can be omitted if they add noise or payload.

Create a repeatable build-time script using `d3-geo` to generate an SVG boundary and projected marker positions from the same Mercator projection. Store the source version and projection parameters. Ship local generated assets, avoiding remote map tiles, API keys, and a runtime mapping SDK. Verify all five city coordinates against a documented geographic source; Natural Earth's populated places dataset is the first candidate.

Start the southern crop near 17 degrees north, then tune it after rendering so Pune and Mumbai remain fully visible with breathing room. Clip geographic artwork only. Keep marker annotations and panels outside that clipping group. Preserve aspect ratio at every breakpoint.

Keep Gorakhpur, Kolkata, Jamshedpur, Pune, and Mumbai dots at their projected positions. Use separate label offsets and fine leader lines for Mumbai/Pune and Kolkata/Jamshedpur. On mobile, separate the interactive callout labels enough to provide at least 44px targets without overlapping; their leader lines retain the connection to the exact city dots. Add a quiet narrative journey line in the supplied order, without implying a precise travel route or using endless animation.

References: [country boundaries](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/), [public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/), [populated places](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/), [D3 projections](https://d3js.org/d3-geo/projection).

**4. Implement the map interaction and its accessible alternative**

Track transient preview and pinned selection separately. Hover or keyboard focus previews a place. Click, tap, Enter, or Space pins it. Selecting another location changes the pinned details. Escape and a visible Close button dismiss the details and prevent immediate reopening until the triggering hover/focus condition has reset.

Use native HTML buttons aligned with the SVG coordinate system, accessible city/stage names, visible focus, and selected indicators that include shape or text. Use labelled nonmodal detail regions, since some panels contain experience links. Keep previews open while the pointer or keyboard focus moves between a trigger and its panel. Closing from within the panel returns focus to the originating control without reopening it.

On wide screens, position and clamp the detail panel within the available viewport. Below the tablet breakpoint, place details below the map. Both layouts use the same content and state. Include a visible location-control list and an always-readable compact journey/education timeline, so education and essential history require no map interaction.

Populate each location exactly as supplied: Gorakhpur roots; Kolkata's three qualifications, years, and scores; Jamshedpur's MCA and CGPA without a denominator; Pune and Mumbai assignment summaries with working links to their experience entries.

**5. Implement professional content and personal details**

Use “Shashi” in navigation and conversational copy, “Shashi Kant” in professional metadata, and the supplied concise full-stack positioning in the introduction. Include View work and View résumé actions. Use no portrait or avatar.

Present TCS as one employer with separate Mumbai and Pune entries, putting the current full-stack role first. Preserve exact dates, responsibilities, locations, the 55-country scope, 40+ KRAs, and 6 organisational levels. Include the 29 August–8 September 2024 training as a small timeline detail and leave the assignment gap unfilled. Include the Perform Digital internship, Groupalike, supplied responsibilities, technologies, and certificate URL.

Create only the two supplied personal-project entries: NewsDozz and WordWise. Use tasteful typographic compositions rather than fabricated screenshots. Include their supplied features, technology lists, taglines, descriptions, and repository links, with “View source” actions.

Group skills exactly as requested, emphasizing Java, Spring Boot, Angular, and SQL while retaining the supplied basic/proficient qualifiers. Write a short factual About section connecting current work, Android experience, education, and interests. Use native expandable hobby controls. Render the gaming alias DEVTA only inside the opened gaming details; it must not appear in introductory text or metadata.

Finish with the supplied email and Google Drive résumé link. Add a copy-email button only with a working fallback and accessible success/failure feedback. Keep the mailto link available independently. Omit unprovided LinkedIn, profile, demo, and social URLs.

**6. Complete accessibility, responsive behavior, and metadata**

Use semantic headings, descriptive links, keyboard-operable controls, visible focus, and readable contrast. Ensure anchor targets remain visible below navigation and the layout works at 200% zoom. Disable decorative transitions and smooth scrolling for `prefers-reduced-motion`; all essential content is visible without animation.

Add a descriptive page title and description using Shashi Kant's professional identity, plus a simple S-monogram SVG favicon. Include appropriate metadata without fabricated canonical, deployment, or social-image URLs. External links opened in new tabs use `rel="noopener noreferrer"`. Add no analytics or tracking.

**7. Validate the implemented result**

Run the production build, TypeScript checks, and the scaffold's appropriate project checks. Add focused tests for meaningful behavior: preview versus selection, changing location, dismissal, experience navigation, and copy-email feedback if implemented. Avoid tests that merely duplicate static markup.

Inspect the actual rendered website with the available browser tooling at representative 320px, 390px, 768px, 1024px, and 1440px widths. Check all five markers and details, the two nearby-city pairs, crop margins, panel bounds, non-overlapping touch targets, horizontal overflow, and typography. Test keyboard traversal, Enter/Space selection, Escape, focus return, pointer movement into panels, mobile menu behavior, touch-style selection, and reduced motion.

Verify every supplied URL against the stored content, check anchor destinations, hobby disclosure, console output, and asset loading. Test email and résumé actions without assuming external account permissions. Inspect title, description, favicon, link security attributes, and the absence of placeholder buttons or invented copy. Record checks that actually ran and clearly distinguish any unavailable checks.

**8. Deliver the source and documentation**

Deliver the complete Angular source, lockfile, generated geographic assets, and map-generation script. Write a concise README covering compatible runtime versions, installation, local development, production build, checks, and content editing. Add `MAP_DATA.md` with geographic sources, licenses, coordinate provenance, boundary convention, projection, crop, label offsets, and regeneration instructions.

The final implementation report should identify what was built, which checks passed, and any remaining limitations. This planning stage does not scaffold, install dependencies, or publish a website.

**Implementation sequence and completion criteria**

Complete setup and the data/design foundation first. Build a map prototype with all five accurately positioned locations next, and verify mobile collision handling before styling the rest of the page. Once shared interfaces and tokens are stable, professional-content sections and map interaction tests can proceed in parallel. Finish with integration, browser inspection, necessary fixes, and documentation.

The implementation is complete when every supplied content requirement is represented, the map works by pointer/keyboard/touch with a readable alternative, all supplied actions work, tested layouts have no overflow, production checks pass, and documentation allows another developer to edit content and regenerate map data.

**Implementation status (4 November 2026)**

The initial Angular implementation is now present. Build and focused unit tests passed; the local preview was restored and inspected in the in-app browser. README.md records remaining browser-validation and map-panel work. This plan remains the acceptance checklist, not a claim that every item is finished.
