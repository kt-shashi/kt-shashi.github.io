import {
  Component,
  computed,
  signal,
  HostListener,
  ElementRef,
  viewChild,
  afterRenderEffect,
  inject,
  DestroyRef,
  afterNextRender,
  input,
} from '@angular/core';
import {
  NavigationCancel,
  NavigationError,
  NavigationSkipped,
  Router,
  RouterLink,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { identity, journey, Place } from './data/portfolio.data';
import { boundaryPath, indiaPath, projection, statePaths } from './data/map.generated';
import { MapDestination, MapTransition } from './map-transition';

const transitionRegions = {
  work: { name: 'Maharashtra', location: 'Mumbai · Pune', city: null },
  projects: { name: 'Jharkhand', location: 'Jamshedpur', city: 'jamshedpur' },
  education: { name: 'West Bengal', location: 'Kolkata', city: 'kolkata' },
} as const;

@Component({
  selector: 'app-journey',
  imports: [RouterLink],
  templateUrl: './journey.html',
  styleUrls: ['./journey.scss', './journey-intro.scss'],
})
export class Journey {
  readonly transitionId = input<number | null>(null);
  readonly transitionDestination = input<MapDestination>('work');
  readonly identity = identity;
  readonly path = indiaPath;
  readonly boundaries = boundaryPath;
  readonly frame = { x: 110, y: 20, width: 1000, height: 670 };
  readonly camera = signal(this.frame);
  readonly departing = signal(false);
  readonly mapFading = signal(false);
  private readonly zoomDestination = signal<MapDestination | null>(null);
  readonly highlightedRegion = computed(() => {
    const destination = this.zoomDestination();
    if (destination === null) return null;
    const region = transitionRegions[destination];
    return {
      ...region,
      path: statePaths[region.name],
    };
  });
  readonly places = journey.map((p) => ({ ...p, point: this.project(p.coordinates) }));
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
  private transitionFrame = 0;
  private transitionPromise?: Promise<boolean>;
  private resolveTransition?: (proceed: boolean) => void;
  private introFrame = 0;
  private removeIntroMotionListener?: () => void;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const transitions = inject(MapTransition);
    afterNextRender(() => {
      const id = this.transitionId();
      if (id !== null) {
        Promise.resolve(this.transitionTo(this.transitionDestination())).then((proceed) => transitions.complete(id, proceed));
      } else {
        destroyRef.onDestroy(transitions.registerHome((destination) => this.transitionTo(destination)));
        if (transitions.claimJourneyIntro()) this.startIntro();
      }
    });
    inject(Router).events
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (
          event instanceof NavigationCancel ||
          event instanceof NavigationError ||
          event instanceof NavigationSkipped
        ) {
          this.cancelMapTransition();
        }
      });
    const reposition = () => this.positionPopup();
    this.main?.addEventListener('scroll', reposition, { passive: true });
    inject(DestroyRef).onDestroy(() => {
      this.main?.removeEventListener('scroll', reposition);
      this.keepPreview();
      this.finishIntro();
      this.cancelMapTransition();
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
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (motion?.matches !== false) return;
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
    const onMotionChange = () => {
      if (motion.matches) this.finishIntro();
    };
    motion.addEventListener?.('change', onMotionChange);
    this.removeIntroMotionListener = () => motion.removeEventListener?.('change', onMotionChange);

    let started: number | undefined;
    const animate = (time: number) => {
      started ??= time;
      const elapsed = time - started;
      const progress = Math.min(Math.max((elapsed - 350) / 1000, 0), 1);
      const eased = progress * progress * (3 - 2 * progress);
      this.camera.set({
        x: start.x + (this.frame.x - start.x) * eased,
        y: start.y + (this.frame.y - start.y) * eased,
        width: start.width + (this.frame.width - start.width) * eased,
        height: start.height + (this.frame.height - start.height) * eased,
      });
      const routeProgress = Math.min(Math.max((elapsed - 1250) / 850, 0), 1);
      this.introRouteProgress.set(routeProgress);
      this.revealedCities.set(stops.filter((stop) => stop <= routeProgress).length);
      this.introContentVisible.set(elapsed >= 2050);
      if (elapsed >= 2400) {
        this.finishIntro();
      } else {
        this.introFrame = requestAnimationFrame(animate);
      }
    };
    this.introFrame = requestAnimationFrame(animate);
  }

  private finishIntro(resetCamera = true) {
    cancelAnimationFrame(this.introFrame);
    this.removeIntroMotionListener?.();
    this.removeIntroMotionListener = undefined;
    this.introPlaying.set(false);
    this.introContentVisible.set(true);
    this.revealedCities.set(this.places.length);
    this.introRouteProgress.set(1);
    if (resetCamera) this.camera.set(this.frame);
  }

  transitionTo(destination: MapDestination): boolean | Promise<boolean> {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches !== false) return true;
    if (this.transitionPromise) return this.transitionPromise;
    this.finishIntro(false);
    this.dismiss();
    this.zoomDestination.set(destination);
    this.departing.set(true);
    this.transitionPromise = new Promise<boolean>((resolve) => {
      this.resolveTransition = resolve;
    });
    let started: number | undefined;
    const start = this.camera();
    const city = transitionRegions[destination].city;
    const target = city ? this.places.find((place) => place.id === city)!.point : [330, 566];
    const middle = { x: 310, y: target[1] - 201, width: 600, height: 402 };
    const end = { x: target[0] - 100, y: target[1] - 67, width: 200, height: 134 };
    const animate = (time: number) => {
      started ??= time;
      const elapsed = time - started;
      const progress = Math.min(elapsed / 1500, 1);
      const firstLeg = progress < 0.55;
      const from = firstLeg ? start : middle;
      const to = firstLeg ? middle : end;
      const legProgress = firstLeg ? progress / 0.55 : (progress - 0.55) / 0.45;
      const eased = legProgress * legProgress * (3 - 2 * legProgress);
      this.camera.set({
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        width: from.width + (to.width - from.width) * eased,
        height: from.height + (to.height - from.height) * eased,
      });
      this.mapFading.set(progress === 1);
      if (elapsed >= 1850) {
        this.resolveTransition?.(true);
        this.resolveTransition = undefined;
      } else {
        this.transitionFrame = requestAnimationFrame(animate);
      }
    };
    this.transitionFrame = requestAnimationFrame(animate);
    return this.transitionPromise;
  }

  cancelMapTransition() {
    cancelAnimationFrame(this.transitionFrame);
    this.resolveTransition?.(false);
    this.resolveTransition = undefined;
    this.transitionPromise = undefined;
    this.departing.set(false);
    this.mapFading.set(false);
    this.zoomDestination.set(null);
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
  project([lon, lat]: [number, number]): [number, number] {
    const r = Math.PI / 180;
    const m = (l: number) => Math.log(Math.tan(Math.PI / 4 + (l * r) / 2));
    return [
      projection.translate[0] + (lon - projection.center[0]) * r * projection.scale,
      projection.translate[1] - (m(lat) - m(projection.center[1])) * projection.scale,
    ];
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
