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
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { identity, journey, Place } from './data/portfolio.data';
import { indiaPath, projection } from './data/map.generated';
@Component({
  selector: 'app-journey',
  imports: [RouterLink],
  templateUrl: './journey.html',
  styleUrl: './journey.scss',
})
export class Journey {
  readonly identity = identity;
  readonly path = indiaPath;
  readonly places = journey.map((p) => ({ ...p, point: this.project(p.coordinates) }));
  readonly selected = signal<string | null>(null);
  readonly preview = signal<string | null>(null);
  readonly active = computed(() =>
    this.places.find((p) => p.id === (this.selected() ?? this.preview())),
  );
  readonly route = this.places.map((p) => p.point.join(',')).join(' ');
  private trigger?: HTMLElement;
  private suppressed = false;
  private readonly popup = viewChild<ElementRef<HTMLElement>>('popup');
  private focusOnOpen = false;
  private readonly main = inject(ElementRef<HTMLElement>).nativeElement.closest('main');

  constructor() {
    const reposition = () => this.positionPopup();
    this.main?.addEventListener('scroll', reposition, { passive: true });
    inject(DestroyRef).onDestroy(() => this.main?.removeEventListener('scroll', reposition));

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
  }
  @HostListener('document:keydown.escape') close() {
    if (!this.active()) return;
    this.dismiss();
    this.suppressed = true;
    this.trigger?.focus({ preventScroll: true });
  }
}
