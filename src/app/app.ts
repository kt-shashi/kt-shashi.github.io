import { afterNextRender, Component, ElementRef, inject, Injector, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Navigation } from './navigation/navigation';
import { Cursor } from './cursor/cursor';

@Component({
  selector: 'app-root',
  imports: [Navigation, RouterOutlet, Cursor],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  constructor() {
    let initial = true;
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        const fragment = this.router.parseUrl(event.urlAfterRedirects).fragment;
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
