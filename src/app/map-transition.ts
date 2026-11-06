import { inject, Injectable, signal } from '@angular/core';
import { NavigationCancel, NavigationError, NavigationSkipped, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type MapDestination = 'work' | 'projects' | 'education';

@Injectable({ providedIn: 'root' })
export class MapTransition {
  readonly overlay = signal<{ id: number; destination: MapDestination } | null>(null);
  private sequence = 0;
  private homeAnimation?: (destination: MapDestination) => boolean | Promise<boolean>;
  private pending?: Promise<boolean>;
  private resolvePending?: (proceed: boolean) => void;
  private introClaimed = false;

  constructor() {
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (
          event instanceof NavigationCancel ||
          event instanceof NavigationError ||
          event instanceof NavigationSkipped
        ) {
          const transition = this.overlay();
          if (transition !== null) this.complete(transition.id, false);
        }
      });
  }

  registerHome(animation: (destination: MapDestination) => boolean | Promise<boolean>) {
    this.homeAnimation = animation;
    return () => {
      if (this.homeAnimation === animation) this.homeAnimation = undefined;
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

  play(destination: MapDestination): boolean | Promise<boolean> {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches !== false) return true;
    if (this.homeAnimation) return this.homeAnimation(destination);
    if (this.pending) return this.pending;
    this.pending = new Promise<boolean>((resolve) => {
      this.resolvePending = resolve;
    });
    this.overlay.set({ id: ++this.sequence, destination });
    return this.pending;
  }

  complete(id: number, proceed: boolean) {
    if (this.overlay()?.id !== id) return;
    this.overlay.set(null);
    this.resolvePending?.(proceed);
    this.resolvePending = undefined;
    this.pending = undefined;
  }
}
