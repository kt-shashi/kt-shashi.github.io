import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes, sections } from './app.routes';
import { App } from './app';
import { Journey } from './journey';
import { journey } from './data/portfolio.data';
describe('Portfolio interactions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  async function openPortfolio() {
    const f = TestBed.createComponent(App);
    f.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/');
    await f.whenStable();
    return f;
  }

  it('keeps navigation mounted while switching to a single active page', async () => {
    const f = await openPortfolio();
    expect(f.nativeElement.textContent).toContain('Hi, I’m Shashi');
    const nav = f.nativeElement.querySelector('nav');
    for (const section of sections) {
      const link = Array.from(nav.querySelectorAll('a')).find(
        (a) => (a as HTMLAnchorElement).textContent?.trim() === section.label,
      ) as HTMLAnchorElement;
      link.click();
      await f.whenStable();
      expect(f.nativeElement.querySelector('nav')).toBe(nav);
      expect(link.getAttribute('aria-current')).toBe('page');
      expect(f.nativeElement.querySelector('main h1')).not.toBeNull();
      expect(f.nativeElement.querySelectorAll('main .section-shell:not(footer)')).toHaveLength(1);
      expect(f.nativeElement.querySelector('main section')?.id).toBe(section.path);
      if (section.path === 'about') {
        expect(f.nativeElement.textContent).toContain(
          'I like games that let me get lost.\nFar Cry, Watch Dogs, and GTA.',
        );
      }
    }
  });
  it('previews, pins, changes and dismisses locations without immediately reopening', () => {
    const f = TestBed.createComponent(Journey);
    const c = f.componentInstance;
    const button = document.createElement('button');
    const event = { currentTarget: button } as unknown as Event;
    c.peek(journey[0], event);
    expect(c.active()?.city).toBe('Gorakhpur');
    c.pin(journey[4], event);
    c.peek(journey[1], event);
    expect(c.active()?.city).toBe('Mumbai');
    c.pin(journey[3], event);
    expect(c.active()?.city).toBe('Pune');
    c.close();
    expect(c.active()).toBeUndefined();
    c.peek(journey[0], event);
    expect(c.active()).toBeUndefined();
    c.leave();
    c.peek(journey[0], event);
    expect(c.active()?.city).toBe('Gorakhpur');
  });
  it('keeps all geographic points inside the map crop', () => {
    const c = TestBed.createComponent(Journey).componentInstance;
    for (const p of c.places) {
      expect(p.point[0]).toBeGreaterThan(0);
      expect(p.point[0]).toBeLessThan(1200);
      expect(p.point[1]).toBeGreaterThan(0);
      expect(p.point[1]).toBeLessThan(660);
    }
  });
  it('exposes all location controls and links assignments to real experience entries', async () => {
    const f = await openPortfolio();
    const markers: HTMLButtonElement[] = Array.from(f.nativeElement.querySelectorAll('.map-label'));
    expect(markers).toHaveLength(journey.length);
    for (const [index, marker] of markers.entries()) {
      marker.click();
      await f.whenStable();
      expect(f.nativeElement.querySelector('#place-title')?.textContent).toBe(journey[index].city);
    }
    for (const p of journey.filter((p) => p.experience)) {
      await TestBed.inject(Router).navigateByUrl('/journey');
      await f.whenStable();
      f.nativeElement.querySelector(`button[aria-label^="${p.city} —"]`).click();
      await f.whenStable();
      f.nativeElement.querySelector('#place-details a').click();
      await f.whenStable();
      expect(TestBed.inject(Router).url).toBe('/work#' + p.experience);
      expect(f.nativeElement.querySelector('#' + p.experience)).not.toBeNull();
    }
  });
});
