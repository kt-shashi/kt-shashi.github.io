import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { NavigationCancel, NavigationError, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  indiaFrame,
  mapAspect,
  MapBox,
  MapRegion,
  MapSection,
  mapRegions,
  sectionRegions,
} from './data/map-views';

interface MapScene {
  box: MapBox;
  camera: MapBox;
  region: MapRegion | null;
  detail: number;
  thumbnail: number;
  opacity: number;
  backdrop: number;
  contentOpacity?: number;
}

type Step = [duration: number, scene: MapScene];

const fadeTime = 360;
const contentRevealTime = 560;
const artworkSettleTime = 460;
const cityTime = 510;
const stateTime = 640;
const travelTime = 480;
const animationPreference = 'portfolio-map-animations';
export const stateMapOpacity = 0.32;

export function mapBackgroundOpacity(section: MapSection): number | undefined {
  if (sectionRegions[section]) return stateMapOpacity;
  if (section === 'about' || section === 'contact') return 0.2;
  return undefined;
}

function storedAnimationsEnabled(): boolean {
  try {
    return localStorage.getItem(animationPreference) !== 'off';
  } catch {
    return true;
  }
}

function interpolateBox(from: MapBox, to: MapBox, t: number): MapBox {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    width: from.width + (to.width - from.width) * t,
    height: from.height + (to.height - from.height) * t,
  };
}

function interpolateCamera(from: MapBox, to: MapBox, t: number): MapBox {
  const linear = interpolateBox(from, to, t);
  const scale = (to.width / from.width) ** t;
  const width = from.width * scale;
  const height = from.height * scale;
  return {
    x: linear.x + (linear.width - width) / 2,
    y: linear.y + (linear.height - height) / 2,
    width,
    height,
  };
}

function overviewCamera(region: MapRegion): MapBox {
  const city = mapRegions[region].cityFrame;
  const offsetX = city.x + city.width / 2 - (indiaFrame.x + indiaFrame.width / 2);
  const offsetY = city.y + city.height / 2 - (indiaFrame.y + indiaFrame.height / 2);
  return { ...indiaFrame, x: indiaFrame.x + offsetX * 0.2, y: indiaFrame.y + offsetY * 0.1 };
}

@Injectable({ providedIn: 'root' })
export class MapTransition {
  private readonly currentScene = signal<MapScene | null>(null);
  readonly scene = this.currentScene.asReadonly();
  private readonly motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  private readonly systemMotionReduced = signal(this.motionQuery?.matches ?? true);
  private readonly userAnimationsEnabled = signal(storedAnimationsEnabled());
  readonly reducedMotion = this.systemMotionReduced.asReadonly();
  readonly animationsEnabled = computed(
    () => this.userAnimationsEnabled() && !this.reducedMotion(),
  );
  private panel?: HTMLElement;
  private navigationId?: number;
  private frame = 0;
  private resolve?: (proceed: boolean) => void;
  private introClaimed = false;

  constructor() {
    const onMotionChange = (event: MediaQueryListEvent) => {
      this.systemMotionReduced.set(event.matches);
      if (event.matches) this.finish();
    };
    this.motionQuery?.addEventListener?.('change', onMotionChange);
    inject(DestroyRef).onDestroy(() => {
      this.motionQuery?.removeEventListener?.('change', onMotionChange);
    });

    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (
          (event instanceof NavigationCancel || event instanceof NavigationError) &&
          event.id === this.navigationId
        ) {
          this.finish(false);
        }
      });
  }

  toggleAnimations() {
    const enabled = !this.userAnimationsEnabled();
    this.userAnimationsEnabled.set(enabled);
    try {
      localStorage.setItem(animationPreference, enabled ? 'on' : 'off');
    } catch {
      // The preference still applies for the current visit.
    }
    if (!enabled) this.finish();
  }

  connect(panel: HTMLElement) {
    this.panel = panel;
    return () => {
      this.finish();
      this.panel = undefined;
    };
  }

  claimJourneyIntro(): boolean {
    if (this.introClaimed) return false;
    this.introClaimed = true;
    try {
      if (sessionStorage.getItem('portfolio-journey-intro')) return false;
      sessionStorage.setItem('portfolio-journey-intro', 'played');
    } catch {
      // The in-memory flag still limits playback when storage is unavailable.
    }
    return true;
  }

  play(id: number, source: MapSection, destination: MapSection): boolean | Promise<boolean> {
    this.finish();
    if (!this.animationsEnabled()) return true;
    const panel = this.panel?.getBoundingClientRect();
    if (!panel?.width || !panel.height) return true;

    this.navigationId = id;
    const width = Math.min(panel.width, panel.height / mapAspect) * 0.96;
    const height = width * mapAspect;
    const country: MapScene = {
      box: { x: (panel.width - width) / 2, y: (panel.height - height) / 2, width, height },
      camera: indiaFrame,
      region: null,
      detail: 0,
      thumbnail: 0,
      opacity: 1,
      backdrop: 1,
    };

    const sourceRegion = sectionRegions[source];
    const sourceOpacity = mapBackgroundOpacity(source);
    const destinationRegion = sectionRegions[destination];
    const travel = sourceRegion && destinationRegion && sourceRegion !== destinationRegion;
    const anchor = source === 'journey' ? this.anchor(panel) : null;
    const steps: Step[] = [];
    if (sourceRegion) {
      const artwork = mapRegions[sourceRegion].artworkFrame;
      const overview = travel ? { ...country, camera: overviewCamera(sourceRegion) } : country;
      const background = {
        ...country,
        camera: artwork,
        region: sourceRegion,
        detail: 1,
        thumbnail: 1,
        opacity: stateMapOpacity,
        contentOpacity: 1,
      };
      this.currentScene.set(background);
      steps.push(
        [240, { ...background, contentOpacity: 0 }],
        [180, { ...background, opacity: 1, contentOpacity: 0 }],
        [
          cityTime,
          {
            ...country,
            region: sourceRegion,
            detail: 0.75,
            camera: interpolateCamera(artwork, overview.camera, 0.42),
          },
        ],
        [stateTime, overview],
      );
    } else if (anchor) {
      this.currentScene.set({
        ...country,
        box: anchor.box,
        camera: anchor.camera ?? indiaFrame,
        opacity: 0,
        backdrop: 0,
      });
      steps.push([fadeTime, country]);
    } else if (sourceOpacity !== undefined) {
      this.currentScene.set({ ...country, opacity: sourceOpacity, contentOpacity: 1 });
      steps.push([fadeTime, { ...country, contentOpacity: 0 }]);
    } else {
      this.currentScene.set({ ...country, opacity: 0, backdrop: 0 });
      steps.push([fadeTime, country]);
    }

    if (destinationRegion) {
      const city = this.cityScene(country, destinationRegion);
      steps.push(
        travel
          ? [travelTime, { ...country, camera: overviewCamera(destinationRegion) }]
          : [100, country],
        [stateTime, this.stateScene(city, destinationRegion)],
        [cityTime, city],
      );
    }
    return this.animate(steps);
  }

  async arrive(id: number, destination: MapSection, fragment: string | null) {
    const scene = this.scene();
    const panel = this.panel?.getBoundingClientRect();
    if (id !== this.navigationId || !scene || !panel) return;

    const anchor = destination === 'journey' && !fragment ? this.anchor(panel) : null;
    const region = sectionRegions[destination];
    const opacity = mapBackgroundOpacity(destination);
    const hidden = { ...scene, contentOpacity: 0 };
    this.currentScene.set(hidden);
    const steps: Step[] = [];
    if (opacity !== undefined) {
      const background = region
        ? { ...hidden, camera: mapRegions[region].artworkFrame, thumbnail: 1 }
        : hidden;
      if (region) steps.push([artworkSettleTime, background]);
      steps.push([contentRevealTime, { ...background, opacity, contentOpacity: 1 }]);
    } else {
      const positioned = anchor?.visible ? { ...hidden, box: anchor.box } : hidden;
      if (anchor?.visible) steps.push([fadeTime, positioned]);
      steps.push([
        contentRevealTime,
        { ...positioned, opacity: 0, backdrop: 0, contentOpacity: 1 },
      ]);
    }
    await this.animate(steps);
    if (this.navigationId === id) this.finish();
  }

  finish(proceed = true) {
    cancelAnimationFrame(this.frame);
    this.currentScene.set(null);
    this.navigationId = undefined;
    this.resolve?.(proceed);
    this.resolve = undefined;
  }

  private anchor(panel: DOMRect) {
    const element = this.panel?.querySelector<HTMLElement>('[data-map-anchor]');
    const rect = element?.getBoundingClientRect();
    if (!rect?.width || !rect.height) return null;
    const visible = rect.bottom > panel.top && rect.top < panel.bottom;
    const viewBox = element?.querySelector('svg')?.viewBox?.baseVal;
    const camera = viewBox?.width
      ? { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height }
      : undefined;
    return {
      visible,
      camera,
      box: {
        x: rect.left - panel.left,
        y: visible ? rect.top - panel.top : 24,
        width: rect.width,
        height: rect.height,
      },
    };
  }

  private cityScene(country: MapScene, region: MapRegion): MapScene {
    return {
      ...country,
      region,
      camera: mapRegions[region].cityFrame,
      detail: 1,
    };
  }

  private stateScene(city: MapScene, region: MapRegion): MapScene {
    return { ...city, camera: mapRegions[region].stateFrame, detail: 0.75 };
  }

  private animate(steps: Step[]): Promise<boolean> {
    let startTime: number | undefined;
    let from = this.scene()!;
    let step = 0;
    return new Promise((resolve) => {
      this.resolve = resolve;
      const advance = (time: number) => {
        startTime ??= time;
        let elapsed = time - startTime;
        while (step < steps.length && elapsed >= steps[step][0]) {
          const [duration, scene] = steps[step++];
          startTime += duration;
          elapsed -= duration;
          from = scene;
        }
        if (step === steps.length) {
          this.currentScene.set(from);
          this.resolve = undefined;
          resolve(true);
          return;
        }

        const [duration, to] = steps[step];
        const progress = elapsed / duration;
        const t = progress * progress * (3 - 2 * progress);
        this.currentScene.set({
          box: interpolateBox(from.box, to.box, t),
          camera: interpolateCamera(from.camera, to.camera, t),
          region: to.region ?? from.region,
          detail: from.detail + (to.detail - from.detail) * t,
          thumbnail: from.thumbnail + (to.thumbnail - from.thumbnail) * t,
          opacity: from.opacity + (to.opacity - from.opacity) * t,
          backdrop: from.backdrop + (to.backdrop - from.backdrop) * t,
          contentOpacity:
            to.contentOpacity === undefined
              ? undefined
              : (from.contentOpacity ?? 0) * (1 - t) + to.contentOpacity * t,
        });
        this.frame = requestAnimationFrame(advance);
      };
      this.frame = requestAnimationFrame(advance);
    });
  }
}
