import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Navigation } from './navigation/navigation';
import { Cursor } from './cursor/cursor';
import { MapSection } from './data/map-views';
import { MapTransition } from './map-transition';
import { SectionMap } from './section-map';

@Component({
  selector: 'app-root',
  host: {
    '(document:contextmenu)': '$event.preventDefault()',
    '(document:copy)': '$event.preventDefault()',
    '(window:resize)': 'mapTransition.finish()',
  },
  imports: [Navigation, RouterOutlet, Cursor, SectionMap],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly mapTransition = inject(MapTransition);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      destroyRef.onDestroy(this.mapTransition.connect(this.panel().nativeElement));
    });

    let initial = true;
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        const fragment = this.router.parseUrl(event.urlAfterRedirects).fragment;
        const section = this.router.routerState.snapshot.root.firstChild?.routeConfig?.path as
          MapSection | undefined;
        const moveFocus = !initial || !!fragment;
        initial = false;
        afterNextRender(
          () => {
            const panel = this.panel().nativeElement;
            const target = fragment && panel.ownerDocument.getElementById(fragment);
            if (target && panel.contains(target)) {
              panel.scrollTop +=
                target.getBoundingClientRect().top - panel.getBoundingClientRect().top;
              target.focus({ preventScroll: true });
            } else {
              panel.scrollTop = 0;
              if (moveFocus) panel.focus({ preventScroll: true });
            }
            if (section) void this.mapTransition.arrive(event.id, section, fragment);
          },
          { injector: this.injector },
        );
      });
  }

  focusContent() {
    const panel = this.panel().nativeElement;
    panel.scrollTop = 0;
    panel.focus({ preventScroll: true });
  }
}
