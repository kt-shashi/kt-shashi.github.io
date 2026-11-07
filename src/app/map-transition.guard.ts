import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MapSection } from './data/map-views';
import { MapTransition } from './map-transition';

export const mapTransitionGuard =
  (destination: MapSection): CanActivateFn =>
  () => {
    const router = inject(Router);
    const source = router.routerState.snapshot.root.firstChild?.routeConfig?.path as
      MapSection | undefined;
    const navigation = router.currentNavigation();
    if (!source || !navigation || source === destination) return true;
    return inject(MapTransition).play(navigation.id, source, destination);
  };
