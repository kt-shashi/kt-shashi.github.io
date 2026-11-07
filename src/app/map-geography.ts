import { Component } from '@angular/core';
import { boundaryPath, indiaPath } from './data/map.generated';

@Component({
  selector: 'g[app-map-geography]',
  template: `
    <svg:path [attr.d]="land" fill="#192a40" stroke="#667181" stroke-width="1.3" />
    <svg:path
      [attr.d]="boundaries"
      fill="none"
      stroke="#9aa6b4"
      stroke-opacity=".78"
      stroke-width="1.45"
      stroke-dasharray=".1 3.6"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
  `,
})
export class MapGeography {
  readonly land = indiaPath;
  readonly boundaries = boundaryPath;
}
