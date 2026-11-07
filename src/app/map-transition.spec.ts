import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { indiaFrame, mapRegions } from './data/map-views';
import { mapBackgroundOpacity, MapTransition, stateMapOpacity } from './map-transition';

describe('Map navigation', () => {
  let nextFrame: FrameRequestCallback;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    localStorage.removeItem('portfolio-map-animations');
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      nextFrame = callback;
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.id === 'main') return new DOMRect(0, 0, 960, 800);
      if (this.hasAttribute('data-map-anchor')) return new DOMRect(90, 160, 620, 415.4);
      return new DOMRect();
    });
  });

  afterEach(() => {
    localStorage.removeItem('portfolio-map-animations');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  async function openSection(path: string) {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl(path);
    await fixture.whenStable();
    return { fixture, router, transition: TestBed.inject(MapTransition) };
  }

  it('fades Work, crosses India and keeps Jamshedpur behind Projects', async () => {
    const { fixture, router, transition } = await openSection('/work');
    const background = fixture.nativeElement.querySelector('.map-background img');
    expect(background.getAttribute('src')).toBe('images/maharashtra-districts.svg');
    const navigation = router.navigateByUrl('/projects');
    await vi.waitFor(() => expect(transition.scene()?.region).toBe('maharashtra'));
    fixture.detectChanges();
    const layer = fixture.nativeElement.querySelector('.map-transition');
    expect(layer.querySelector('svg')).toBeNull();
    const fullSizeBox = transition.scene()?.box;
    expect(transition.scene()?.thumbnail).toBe(1);
    nextFrame(0);
    nextFrame(240);
    expect(transition.scene()?.contentOpacity).toBe(0);
    expect(transition.scene()?.opacity).toBe(stateMapOpacity);
    expect(transition.scene()?.box).toEqual(fullSizeBox);
    nextFrame(420);
    expect(transition.scene()?.opacity).toBe(1);
    expect(transition.scene()?.thumbnail).toBe(1);
    expect(transition.scene()?.camera).toEqual(mapRegions.maharashtra.artworkFrame);
    nextFrame(930);
    fixture.detectChanges();
    expect(layer.querySelector('svg path').namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(transition.scene()!.camera.width).toBeGreaterThan(
      mapRegions.maharashtra.artworkFrame.width,
    );
    expect(transition.scene()!.camera.width).toBeLessThan(indiaFrame.width);
    nextFrame(1570);
    const departureOverview = transition.scene()!.camera;
    expect(departureOverview.width).toBe(indiaFrame.width);
    expect(departureOverview.x).toBeLessThan(indiaFrame.x);
    nextFrame(1810);
    const midFlightOverview = transition.scene()!.camera;
    expect(midFlightOverview.x).toBeGreaterThan(departureOverview.x);
    expect(midFlightOverview.width).toBe(indiaFrame.width);
    nextFrame(2050);
    expect(transition.scene()?.camera.x).toBeGreaterThan(midFlightOverview.x);
    expect(router.url).toBe('/work');
    nextFrame(2690);
    expect(transition.scene()?.camera).toEqual(mapRegions.jharkhand.stateFrame);
    nextFrame(3200);
    await navigation;
    await fixture.whenStable();
    expect(router.url).toBe('/projects');
    expect(fixture.nativeElement.querySelector('.map-transition')).toBe(layer);
    expect(transition.scene()?.camera).toEqual(mapRegions.jharkhand.cityFrame);
    nextFrame(3250);
    nextFrame(3480);
    fixture.detectChanges();
    expect(transition.scene()?.box).toEqual(fullSizeBox);
    expect(transition.scene()?.thumbnail).toBeCloseTo(0.5);
    expect(transition.scene()!.camera.width).toBeGreaterThan(mapRegions.jharkhand.cityFrame.width);
    expect(transition.scene()!.camera.width).toBeLessThan(mapRegions.jharkhand.artworkFrame.width);
    expect(layer.querySelector('img').style.transform).toMatch(/scale\(1\./);
    expect(transition.scene()?.contentOpacity).toBe(0);
    nextFrame(3990);
    fixture.detectChanges();
    expect(transition.scene()?.box).toEqual(fullSizeBox);
    expect(transition.scene()?.contentOpacity).toBeCloseTo(0.5);
    expect(transition.scene()?.thumbnail).toBe(1);
    expect(transition.scene()?.camera).toEqual(mapRegions.jharkhand.artworkFrame);
    expect(layer.querySelector('svg')).toBeNull();
    nextFrame(4270);
    await fixture.whenStable();
    expect(transition.scene()).toBeNull();
    const map = fixture.nativeElement.querySelector('.map-background app-section-map');
    expect(map.querySelector('img').getAttribute('src')).toBe('images/jharkhand-districts.svg');
    expect(map.querySelector('svg')).toBeNull();
    expect(map.getAttribute('aria-label')).toContain('Jamshedpur');
  });

  it('holds Kolkata behind Education and clears the text before zooming out', async () => {
    const { fixture, router, transition } = await openSection('/about');
    const entry = router.navigateByUrl('/education');
    await vi.waitFor(() => expect(transition.scene()).not.toBeNull());
    nextFrame(0);
    nextFrame(1610);
    await entry;
    await fixture.whenStable();
    const cityBox = transition.scene()?.box;
    expect(transition.scene()?.camera).toEqual(mapRegions['west-bengal'].cityFrame);
    expect(transition.scene()?.contentOpacity).toBe(0);
    nextFrame(1700);
    nextFrame(2440);
    expect(transition.scene()?.box).toEqual(cityBox);
    expect(transition.scene()?.thumbnail).toBe(1);
    expect(transition.scene()?.contentOpacity).toBeCloseTo(0.5);
    nextFrame(2720);
    await fixture.whenStable();

    const main = fixture.nativeElement.querySelector('main');
    expect(main.querySelectorAll('#education .timeline li')).toHaveLength(4);
    expect(main.querySelector('app-section-map')).toBeNull();
    const background = fixture.nativeElement.querySelector('.map-background app-section-map');
    expect(background.querySelector('img').getAttribute('src')).toBe(
      'images/west-bengal-districts.svg',
    );
    expect(background.querySelector('svg')).toBeNull();
    main.scrollTop = 300;
    const exit = router.navigateByUrl('/about');
    await vi.waitFor(() => expect(transition.scene()?.contentOpacity).toBe(1));
    expect(transition.scene()?.box).toEqual(cityBox);
    nextFrame(3000);
    nextFrame(3240);
    expect(transition.scene()?.contentOpacity).toBe(0);
    expect(transition.scene()?.opacity).toBe(stateMapOpacity);
    nextFrame(3420);
    expect(transition.scene()?.camera).toEqual(mapRegions['west-bengal'].artworkFrame);
    expect(transition.scene()?.opacity).toBe(1);
    expect(transition.scene()?.thumbnail).toBe(1);
    nextFrame(3930);
    expect(transition.scene()!.camera.width).toBeGreaterThan(
      mapRegions['west-bengal'].artworkFrame.width,
    );
    nextFrame(4570);
    await exit;
    await fixture.whenStable();
    nextFrame(4600);
    nextFrame(5160);
    await fixture.whenStable();
    expect(transition.scene()).toBeNull();
    expect(fixture.nativeElement.querySelector('.map-background svg')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.map-background img')).toBeNull();
  });

  it('keeps a faint India map behind About and Contact and fades their content', async () => {
    const { fixture, router, transition } = await openSection('/about');
    const opacity = mapBackgroundOpacity('about')!;
    expect(fixture.nativeElement.querySelector('.map-background').style.opacity).toBe(
      String(opacity),
    );
    const navigation = router.navigateByUrl('/contact');
    await vi.waitFor(() => expect(transition.scene()).not.toBeNull());
    nextFrame(0);
    nextFrame(180);
    expect(transition.scene()?.camera).toEqual(indiaFrame);
    expect(transition.scene()?.opacity).toBeCloseTo((1 + opacity) / 2);
    expect(transition.scene()?.contentOpacity).toBeCloseTo(0.5);
    nextFrame(360);
    await navigation;
    await fixture.whenStable();
    nextFrame(400);
    nextFrame(680);
    expect(transition.scene()?.region).toBeNull();
    expect(transition.scene()?.camera).toEqual(indiaFrame);
    expect(transition.scene()?.opacity).toBeCloseTo((1 + opacity) / 2);
    expect(transition.scene()?.contentOpacity).toBeCloseTo(0.5);
    nextFrame(960);
    await fixture.whenStable();
    expect(transition.scene()).toBeNull();
    expect(router.url).toBe('/contact');
    expect(fixture.nativeElement.querySelector('.map-background svg')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.map-background').style.opacity).toBe(
      String(opacity),
    );
  });

  it('positions the Journey map before revealing the page', async () => {
    const { fixture, router, transition } = await openSection('/about');
    const navigation = router.navigateByUrl('/journey');
    await vi.waitFor(() => expect(transition.scene()).not.toBeNull());
    nextFrame(0);
    nextFrame(360);
    await navigation;
    await fixture.whenStable();
    nextFrame(400);
    nextFrame(760);
    expect(transition.scene()?.box).toEqual({ x: 90, y: 160, width: 620, height: 415.4 });
    expect(transition.scene()?.contentOpacity).toBe(0);
    nextFrame(1040);
    expect(transition.scene()?.contentOpacity).toBeCloseTo(0.5);
    nextFrame(1320);
    await fixture.whenStable();
    expect(transition.scene()).toBeNull();
    expect(fixture.nativeElement.querySelector('#journey')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.map-background')).toBeNull();
  });

  it('clears an interrupted exit and allows the next tab to take over', async () => {
    const { fixture, router, transition } = await openSection('/work');
    const first = router.navigateByUrl('/projects');
    await vi.waitFor(() => expect(transition.scene()?.region).toBe('maharashtra'));
    const second = router.navigateByUrl('/skills');
    await expect(first).resolves.toBe(false);
    await vi.waitFor(() => expect(transition.scene()?.region).toBe('maharashtra'));
    transition.finish();
    await expect(second).resolves.toBe(true);
    await fixture.whenStable();
    expect(router.url).toBe('/skills');
    expect(transition.scene()).toBeNull();
    expect(
      fixture.nativeElement
        .querySelector('.map-background app-section-map')
        .getAttribute('aria-label'),
    ).toContain('Jamshedpur');
  });

  it('finishes an active trip and skips later trips when the visitor switches animations off', async () => {
    const { fixture, router, transition } = await openSection('/work');
    const navigation = router.navigateByUrl('/projects');
    await vi.waitFor(() => expect(transition.scene()).not.toBeNull());
    const toggle = fixture.nativeElement.querySelector('button[role="switch"]');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    toggle.click();
    await expect(navigation).resolves.toBe(true);
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(localStorage.getItem('portfolio-map-animations')).toBe('off');
    expect(transition.scene()).toBeNull();

    await expect(router.navigateByUrl('/education')).resolves.toBe(true);
    await fixture.whenStable();
    expect(transition.scene()).toBeNull();
    expect(fixture.nativeElement.querySelector('.map-background app-section-map')).not.toBeNull();
  });
});
