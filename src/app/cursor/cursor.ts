import { afterNextRender, Component, DestroyRef, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'app-cursor',
  host: { 'aria-hidden': 'true' },
  template: '',
  styleUrl: './cursor.scss',
})
export class Cursor {
  private readonly element = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const listeners = new AbortController();
      const options = { passive: true, signal: listeners.signal };
      const hide = () => this.element.removeAttribute('data-visible');

      document.addEventListener(
        'pointermove',
        (event) => {
          if (event.pointerType !== 'mouse') {
            hide();
            return;
          }
          this.element.style.setProperty('--cursor-x', event.clientX + 'px');
          this.element.style.setProperty('--cursor-y', event.clientY + 'px');
          this.element.setAttribute('data-visible', '');
        },
        options,
      );
      document.addEventListener(
        'pointerdown',
        (event) => {
          if (event.pointerType !== 'mouse') hide();
        },
        options,
      );
      document.documentElement.addEventListener('pointerleave', hide, options);
      document.addEventListener('keydown', hide, options);
      window.addEventListener('blur', hide, options);
      this.destroyRef.onDestroy(() => listeners.abort());
    });
  }
}
