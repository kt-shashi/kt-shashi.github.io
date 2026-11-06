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

  private touchesPhoto(x: number, y: number): boolean {
    const photo = document.querySelector('[data-cursor-exclude]');
    if (!photo) return false;
    const bounds = photo.getBoundingClientRect();
    const radius = parseFloat(getComputedStyle(this.element).getPropertyValue('--cursor-diameter')) / 2;
    const dx = Math.max(bounds.left - x, 0, x - bounds.right);
    const dy = Math.max(bounds.top - y, 0, y - bounds.bottom);
    return dx * dx + dy * dy <= radius * radius;
  }

  constructor() {
    afterNextRender(() => {
      const listeners = new AbortController();
      const options = { passive: true, signal: listeners.signal };
      let portrait: HTMLElement | null = null;
      const clearPortrait = () => {
        portrait?.removeAttribute('data-revealing');
        portrait = null;
        this.element.removeAttribute('data-portrait');
      };
      const hide = () => {
        this.element.removeAttribute('data-visible');
        clearPortrait();
      };

      document.addEventListener(
        'pointermove',
        (event) => {
          if (event.pointerType !== 'mouse' || this.touchesPhoto(event.clientX, event.clientY)) {
            hide();
            return;
          }
          this.element.style.setProperty('--cursor-x', event.clientX + 'px');
          this.element.style.setProperty('--cursor-y', event.clientY + 'px');
          this.element.setAttribute('data-visible', '');
          const heading = event.target instanceof Element
            ? event.target.closest<HTMLElement>('[data-portrait-heading]')
            : null;
          if (portrait !== heading) clearPortrait();
          if (heading) {
            portrait = heading;
            const bounds = heading.getBoundingClientRect();
            heading.style.setProperty('--portrait-x', event.clientX - bounds.left + 'px');
            heading.style.setProperty('--portrait-y', event.clientY - bounds.top + 'px');
            heading.setAttribute('data-revealing', '');
            this.element.setAttribute('data-portrait', '');
          }
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
      document.addEventListener('scroll', hide, { ...options, capture: true });
      window.addEventListener('blur', hide, options);
      this.destroyRef.onDestroy(() => listeners.abort());
    });
  }
}
