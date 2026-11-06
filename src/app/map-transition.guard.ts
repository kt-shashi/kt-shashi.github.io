import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { MapDestination, MapTransition } from './map-transition';

export const mapTransitionGuard =
  (destination: MapDestination): CanActivateFn =>
  () =>
    inject(MapTransition).play(destination);
