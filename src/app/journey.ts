import {
  Component,
  computed,
  effect,
  signal,
  HostListener,
  ElementRef,
  viewChild,
  afterRenderEffect,
  inject,
  DestroyRef,
  afterNextRender,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { identity, journey, Place } from './data/portfolio.data';
import { indiaFrame, project } from './data/map-views';
import { MapGeography } from './map-geography';
import { MapTransition } from './map-transition';

@Component({
  selector: 'app-journey',
  imports: [RouterLink, MapGeography],
  templateUrl: './journey.html',
  styleUrls: ['./journey.scss', './journey-intro.scss'],
})
export class Journey {
  private readonly transitions = inject(MapTransition);
  readonly animationsEnabled = this.transitions.animationsEnabled;
  readonly identity = identity;
  readonly frame = indiaFrame;
  readonly camera = signal(this.frame);
  readonly places = journey.map((p) => ({ ...p, point: project(p.coordinates) }));
  readonly introPlaying = signal(false);
  readonly introContentVisible = signal(true);
  readonly revealedCities = signal(this.places.length);
  readonly introRouteProgress = signal(1);
  readonly labelScale = computed(() => this.camera().width / this.frame.width);
  readonly selected = signal<string | null>(null);
  readonly preview = signal<string | null>(null);
  readonly active = computed(() =>
    this.places.find((p) => p.id === (this.selected() ?? this.preview())),
  );
  readonly route = this.places.map((p) => p.point.join(',')).join(' ');
  private trigger?: HTMLElement;
  private suppressed = false;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private readonly popup = viewChild<ElementRef<HTMLElement>>('popup');
  private focusOnOpen = false;
  private readonly main = inject(ElementRef<HTMLElement>).nativeElement.closest('main');
  private introFrame = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const transitions = this.transitions;
    afterNextRender(() => {
      if (
        transitions.claimJourneyIntro() &&
        transitions.animationsEnabled() &&
        !transitions.scene()
      ) {
        this.startIntro();
      }
    });
    effect(() => {
      if (!transitions.animationsEnabled() && this.introPlaying()) this.finishIntro();
    });
    const reposition = () => this.positionPopup();
    this.main?.addEventListener('scroll', reposition, { passive: true });
    destroyRef.onDestroy(() => {
      this.main?.removeEventListener('scroll', reposition);
      this.keepPreview();
      this.finishIntro();
    });

    afterRenderEffect(() => {
      this.active();
      this.selected();
      const panel = this.popup()?.nativeElement;
      if (!panel) return;
      this.positionPopup();
      if (this.focusOnOpen) {
        panel.focus({ preventScroll: true });
        this.focusOnOpen = false;
      }
    });
  }

  private startIntro() {
    const [x, y] = this.places[0].point;
    const start = { x: x - 100, y: y - 67, width: 200, height: 134 };
    this.camera.set(start);
    this.introPlaying.set(true);
    this.introContentVisible.set(false);
    this.revealedCities.set(1);
    this.introRouteProgress.set(0);

    const distances = [0];
    for (let i = 1; i < this.places.length; i++) {
      const previous = this.places[i - 1].point;
      const current = this.places[i].point;
      distances.push(distances[i - 1] + Math.hypot(current[0] - previous[0], current[1] - previous[1]));
    }
    const stops = distances.map((distance) => distance / distances[distances.length - 1]);

    const zoomDelay = 500;
    const zoomDuration = 1550;
    const routeStart = zoomDelay + zoomDuration - 150;
    const routeDuration = 1550;
    const revealAt = routeStart + routeDuration;
    const finishAt = revealAt + 350;

    let started: number | undefined;
    const animate = (time: number) => {
      started ??= time;
      const elapsed = time - started;
      const progress = Math.min(Math.max((elapsed - zoomDelay) / zoomDuration, 0), 1);
      const eased = progress * progress * (3 - 2 * progress);
      this.camera.set({
        x: start.x + (this.frame.x - start.x) * eased,
        y: start.y + (this.frame.y - start.y) * eased,
        width: start.width + (this.frame.width - start.width) * eased,
        height: start.height + (this.frame.height - start.height) * eased,
      });
      const routeProgress = Math.min(Math.max((elapsed - routeStart) / routeDuration, 0), 1);
      this.introRouteProgress.set(routeProgress);
      this.revealedCities.set(stops.filter((stop) => stop <= routeProgress).length);
      this.introContentVisible.set(elapsed >= revealAt);
      if (elapsed >= finishAt) {
        this.finishIntro();
      } else {
        this.introFrame = requestAnimationFrame(animate);
      }
    };
    this.introFrame = requestAnimationFrame(animate);
  }

  private finishIntro() {
    cancelAnimationFrame(this.introFrame);
    this.introPlaying.set(false);
    this.introContentVisible.set(true);
    this.revealedCities.set(this.places.length);
    this.introRouteProgress.set(1);
    this.camera.set(this.frame);
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  positionPopup() {
    const panel = this.popup()?.nativeElement;
    if (!panel || !this.trigger) return;
    const anchor = this.trigger.getBoundingClientRect();
    const gap = 8;
    const bounds = this.main?.getBoundingClientRect();
    const width = bounds?.right ?? document.documentElement.clientWidth;
    const height = bounds?.bottom ?? document.documentElement.clientHeight;
    const panelTop = bounds?.top ?? 0;
    panel.style.maxHeight = Math.max(0, height - panelTop - 2 * gap) + 'px';
    if (anchor.bottom < panelTop || anchor.top > height) {
      this.dismiss();
      return;
    }
    const left = Math.max(
      gap,
      Math.min(
        anchor.left + (anchor.width - panel.offsetWidth) / 2,
        width - panel.offsetWidth - gap,
      ),
    );
    const below = height - anchor.bottom;
    const top =
      below >= panel.offsetHeight + gap || below > anchor.top - panelTop
        ? anchor.bottom + gap
        : anchor.top - panel.offsetHeight - gap;
    panel.style.left = left + 'px';
    panel.style.top =
      Math.max(panelTop + gap, Math.min(top, height - panel.offsetHeight - gap)) + 'px';
  }

  @HostListener('document:pointerdown', ['$event'])
  dismissOutside(event: PointerEvent) {
    if (
      this.active() &&
      event.target instanceof Element &&
      !event.target.closest('#place-details, .map-label, .city-mark')
    ) {
      this.dismiss();
    }
  }

  dismiss() {
    this.keepPreview();
    this.focusOnOpen = false;
    this.selected.set(null);
    this.preview.set(null);
  }
  peek(place: Place, event: Event) {
    this.keepPreview();
    if (!this.suppressed && !this.selected()) {
      this.preview.set(place.id);
      this.trigger = event.currentTarget as HTMLElement;
    }
  }
  pin(place: Place, event: Event) {
    this.select(place, event.currentTarget as HTMLElement);
  }
  select(place: Place, anchor: Element | null) {
    if (!(anchor instanceof HTMLElement)) return;
    this.focusOnOpen = true;
    this.suppressed = false;
    this.selected.set(place.id);
    this.preview.set(null);
    this.trigger = anchor;
    this.positionPopup();
  }
  leave() {
    this.suppressed = false;
    this.keepPreview();
    if (!this.preview()) return;
    // Allow the pointer to cross the gap between the label and its popup.
    this.closeTimer = setTimeout(() => {
      const panel = this.popup()?.nativeElement;
      if (panel?.matches(':hover, :focus-within') || this.trigger?.matches(':hover, :focus-visible')) return;
      this.preview.set(null);
    }, 180);
  }
  keepPreview() {
    clearTimeout(this.closeTimer);
  }
  @HostListener('document:keydown.escape') close() {
    if (this.introPlaying()) {
      this.finishIntro();
      return;
    }
    if (!this.active()) return;
    this.dismiss();
    this.suppressed = true;
    this.trigger?.focus({ preventScroll: true });
  }
}
