import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { indiaFrame, mapRegions } from './data/map-views';
import { MapTransition } from './map-transition';

describe('Map navigation', () => {
  let nextFrame: FrameRequestCallback;
  let reducedMotion: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    reducedMotion = true;
    vi.stubGlobal('matchMedia', () => ({ matches: reducedMotion }));
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      nextFrame = callback;
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.id === 'main') return new DOMRect(0, 0, 960, 800);
      if (this.hasAttribute('data-map-anchor')) return new DOMRect(590, 30, 345, 231);
      return new DOMRect();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  async function openSection(path: string) {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl(path);
    await fixture.whenStable();
    reducedMotion = false;
    return { fixture, router, transition: TestBed.inject(MapTransition) };
  }

  it('undocks Work, crosses the India map and docks at Jamshedpur on Projects', async () => {
    const { fixture, router, transition } = await openSection('/work');
    const navigation = router.navigateByUrl('/projects');
    await vi.waitFor(() => expect(transition.scene()?.region).toBe('maharashtra'));
    fixture.detectChanges();
    const layer = fixture.nativeElement.querySelector('.map-transition');
    expect(layer.querySelector('svg')).toBeNull();
    expect(transition.scene()?.box).toEqual({ x: 590, y: 30, width: 345, height: 231 });
    expect(transition.scene()?.thumbnail).toBe(1);
    nextFrame(0);
    nextFrame(255);
    expect(transition.scene()?.box.width).toBeGreaterThan(345);
    expect(transition.scene()?.thumbnail).toBe(1);
    nextFrame(660);
    fixture.detectChanges();
    expect(layer.querySelector('svg path').namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(transition.scene()?.box.width).toBeGreaterThan(345);
    expect(transition.scene()?.camera).toEqual(mapRegions.maharashtra.cityFrame);
    nextFrame(1090);
    expect(transition.scene()?.camera).toEqual(mapRegions.maharashtra.stateFrame);
    nextFrame(1610);
    expect(transition.scene()?.camera).toEqual(indiaFrame);
    expect(router.url).toBe('/work');
    nextFrame(2230);
    expect(transition.scene()?.camera).toEqual(mapRegions.jharkhand.stateFrame);
    nextFrame(2660);
    await navigation;
    await fixture.whenStable();
    expect(router.url).toBe('/projects');
    expect(fixture.nativeElement.querySelector('.map-transition')).toBe(layer);
    expect(transition.scene()?.camera).toEqual(mapRegions.jharkhand.cityFrame);
    nextFrame(2700);
    const fullSizeBox = transition.scene()?.box;
    nextFrame(2775);
    expect(transition.scene()?.box).toEqual(fullSizeBox);
    expect(transition.scene()?.thumbnail).toBeCloseTo(0.5);
    nextFrame(3105);
    fixture.detectChanges();
    expect(transition.scene()?.box.width).toBeGreaterThan(345);
    expect(transition.scene()?.backdrop).toBeCloseTo(0.5);
    expect(transition.scene()?.thumbnail).toBe(1);
    expect(layer.querySelector('svg')).toBeNull();
    nextFrame(3360);
    await fixture.whenStable();
    expect(transition.scene()).toBeNull();
    const map = fixture.nativeElement.querySelector('main [data-map-anchor]');
    expect(map.querySelector('img').getAttribute('src')).toBe('images/jharkhand-districts.svg');
    expect(map.querySelector('svg')).toBeNull();
    expect(map.getAttribute('aria-label')).toContain('Jamshedpur');
  });

  it('crossfades between About and Contact at country scale', async () => {
    const { fixture, router, transition } = await openSection('/about');
    const navigation = router.navigateByUrl('/contact');
    await vi.waitFor(() => expect(transition.scene()).not.toBeNull());
    nextFrame(0);
    nextFrame(180);
    expect(transition.scene()?.camera).toEqual(indiaFrame);
    expect(transition.scene()?.opacity).toBeCloseTo(0.5);
    nextFrame(360);
    await navigation;
    await fixture.whenStable();
    nextFrame(400);
    nextFrame(580);
    expect(transition.scene()?.region).toBeNull();
    expect(transition.scene()?.camera).toEqual(indiaFrame);
    expect(transition.scene()?.opacity).toBeCloseTo(0.5);
    nextFrame(760);
    await fixture.whenStable();
    expect(transition.scene()).toBeNull();
    expect(router.url).toBe('/contact');
  });

  it('clears an interrupted exit and allows the next tab to take over', async () => {
    const { fixture, router, transition } = await openSection('/work');
    const first = router.navigateByUrl('/projects');
    await vi.waitFor(() => expect(transition.scene()?.region).toBe('maharashtra'));
    reducedMotion = true;
    const second = router.navigateByUrl('/skills');
    await expect(first).resolves.toBe(false);
    await expect(second).resolves.toBe(true);
    await fixture.whenStable();
    expect(router.url).toBe('/skills');
    expect(transition.scene()).toBeNull();
    expect(
      fixture.nativeElement.querySelector('main [data-map-anchor]').getAttribute('aria-label'),
    ).toContain('Jamshedpur');
  });
});
