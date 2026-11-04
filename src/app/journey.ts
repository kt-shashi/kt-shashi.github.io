import { Component, computed, signal, HostListener } from '@angular/core';
import { journey, Place } from './data/portfolio.data';
import { indiaPath, projection } from './data/map.generated';
@Component({
  selector: 'app-journey',
  standalone: true,
  templateUrl: './journey.html',
  styleUrl: './journey.scss',
})
export class Journey {
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
    this.suppressed = false;
    this.selected.set(place.id);
    this.preview.set(null);
    this.trigger = event.currentTarget as HTMLElement;
  }
  leave() {
    this.suppressed = false;
  }
  @HostListener('document:keydown.escape') close() {
    const had = !!this.active();
    this.selected.set(null);
    this.preview.set(null);
    this.suppressed = true;
    if (had) this.trigger?.focus();
  }
}
