import { inject, Injectable, signal } from '@angular/core';
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
  hideAnchor: boolean;
}

type Step = [duration: number, scene: MapScene];

const fadeTime = 360;
const dockTime = 660;
const thumbnailFadeTime = 150;
const cityTime = 430;
const stateTime = 520;

function interpolateBox(from: MapBox, to: MapBox, t: number): MapBox {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    width: from.width + (to.width - from.width) * t,
    height: from.height + (to.height - from.height) * t,
  };
}

@Injectable({ providedIn: 'root' })
export class MapTransition {
  private readonly currentScene = signal<MapScene | null>(null);
  readonly scene = this.currentScene.asReadonly();
  private panel?: HTMLElement;
  private navigationId?: number;
  private frame = 0;
  private resolve?: (proceed: boolean) => void;
  private introClaimed = false;

  constructor() {
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
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches !== false) return true;
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
      hideAnchor: false,
    };

    const sourceRegion = sectionRegions[source];
    const anchor = this.anchor(panel);
    const steps: Step[] = [];
    if (sourceRegion && anchor) {
      const city = this.cityScene(country, sourceRegion);
      this.currentScene.set({
        ...city,
        box: anchor.box,
        opacity: anchor.visible ? 1 : 0,
        backdrop: 0,
        thumbnail: 1,
      });
      steps.push(
        [dockTime - thumbnailFadeTime, { ...city, thumbnail: 1 }],
        [thumbnailFadeTime, city],
        [cityTime, this.stateScene(city, sourceRegion)],
        [stateTime, country],
      );
    } else if (source === 'journey' && anchor) {
      this.currentScene.set({
        ...country,
        box: anchor.box,
        camera: anchor.camera ?? indiaFrame,
        opacity: 0,
        backdrop: 0,
      });
      steps.push([fadeTime, country]);
    } else {
      this.currentScene.set({ ...country, opacity: 0, backdrop: 0 });
      steps.push([fadeTime, country]);
    }

    const destinationRegion = sectionRegions[destination];
    if (destinationRegion) {
      const city = this.cityScene(country, destinationRegion);
      steps.push(
        [100, country],
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

    const anchor = fragment ? null : this.anchor(panel);
    const region = sectionRegions[destination];
    const fade = { ...scene, opacity: 0, backdrop: 0, hideAnchor: false };
    const steps: Step[] = [];
    if (anchor?.visible && region) {
      const expandedThumbnail = { ...scene, thumbnail: 1 };
      const docked = {
        ...expandedThumbnail,
        box: anchor.box,
        backdrop: 0,
      };
      steps.push([thumbnailFadeTime, expandedThumbnail], [dockTime - thumbnailFadeTime, docked]);
    } else if (anchor?.visible && destination === 'journey') {
      steps.push([fadeTime, { ...fade, box: anchor.box }]);
    } else {
      steps.push([fadeTime, fade]);
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
      hideAnchor: true,
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
          camera: interpolateBox(from.camera, to.camera, t),
          region: to.region ?? from.region,
          detail: from.detail + (to.detail - from.detail) * t,
          thumbnail: from.thumbnail + (to.thumbnail - from.thumbnail) * t,
          opacity: from.opacity + (to.opacity - from.opacity) * t,
          backdrop: from.backdrop + (to.backdrop - from.backdrop) * t,
          hideAnchor: from.hideAnchor || to.hideAnchor,
        });
        this.frame = requestAnimationFrame(advance);
      };
      this.frame = requestAnimationFrame(advance);
    });
  }
}
