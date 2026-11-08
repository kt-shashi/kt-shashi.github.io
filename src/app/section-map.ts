import { Component, computed, input } from '@angular/core';
import { indiaFrame, MapBox, mapCropStyle, MapRegion, mapRegions } from './data/map-views';
import { MapGeography } from './map-geography';

function viewBox({ x, y, width, height }: MapBox): string {
  return `${x} ${y} ${width} ${height}`;
}

@Component({
  selector: 'app-section-map',
  imports: [MapGeography],
  host: {
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[class.map-crop-blend]': 'cropStyle() !== null',
    '[style]': 'cropStyle()',
  },
  templateUrl: './section-map.html',
  styleUrl: './section-map.scss',
})
export class SectionMap {
  readonly region = input<MapRegion | null>(null);
  readonly camera = input<MapBox>();
  readonly detailOpacity = input(1);
  readonly thumbnailOpacity = input<number>();

  readonly detail = computed(() => {
    const region = this.region();
    return region ? mapRegions[region] : null;
  });
  readonly frame = computed(() => this.camera() ?? this.detail()?.cityFrame ?? indiaFrame);
  readonly pinOpacity = computed(() => {
    const region = this.detail();
    if (!region) return 0;
    const zoom =
      (region.stateFrame.width - this.frame().width) /
      (region.stateFrame.width - region.cityFrame.width);
    return Math.min(1, Math.max(0, zoom));
  });
  readonly viewBox = computed(() => viewBox(this.frame()));
  readonly thumbnailImage = computed(() => {
    const region = this.region();
    return region ? `images/${region}-districts.svg` : null;
  });
  readonly thumbnailTransform = computed(() => {
    const camera = this.camera();
    const artwork = this.detail()?.artworkFrame;
    if (!camera || !artwork) return null;

    const scale = artwork.width / camera.width;
    const offsetX = artwork.x + artwork.width / 2 - (camera.x + camera.width / 2);
    const offsetY = artwork.y + artwork.height / 2 - (camera.y + camera.height / 2);
    return `translate(${(offsetX / camera.width) * 100}%, ${(offsetY / camera.height) * 100}%) scale(${scale})`;
  });
  readonly thumbnail = computed(() => this.thumbnailOpacity() ?? (this.region() ? 1 : 0));
  readonly cropStyle = computed(() => {
    const frame = this.frame();
    const artwork = this.detail()?.artworkFrame;
    // The district SVGs already fade their own context when shown at full size.
    if (this.thumbnail() === 1 && (!this.camera() || frame === artwork)) return null;
    return mapCropStyle(frame);
  });
  readonly label = computed(() => {
    const detail = this.detail();
    return detail
      ? `Political map of ${detail.name} with ${detail.pins.map((pin) => pin.name).join(' and ')} marked`
      : 'Political map of India';
  });
}
