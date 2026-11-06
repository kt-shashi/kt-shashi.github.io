import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { MapDestination, MapTransition } from './map-transition';

describe('Map navigation from every section', () => {
  let nextFrame: FrameRequestCallback;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      nextFrame = callback;
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => vi.unstubAllGlobals());

  const destinations: MapDestination[] = ['work', 'projects', 'education'];
  const cases = destinations.flatMap((destination) =>
    ['journey', 'work', 'projects', 'skills', 'education', 'about', 'contact']
      .filter((source) => source !== destination)
      .map((source) => ({ source, destination })),
  );

  it.each(cases)(
    'plays the large map from $source to $destination',
    async ({ source, destination }) => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/' + source);
      await fixture.whenStable();
      vi.stubGlobal('matchMedia', () => ({ matches: false }));
      const transition = TestBed.inject(MapTransition);
      const targetUrl = destination === 'work' ? '/work#tcs-pune' : '/' + destination;
      const navigation = router.navigateByUrl(targetUrl);
      await vi.waitFor(() => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.departing .map-stage svg')).not.toBeNull();
      });
      expect(router.url).toBe('/' + source);
      const region = { work: 'Maharashtra', projects: 'Jharkhand', education: 'West Bengal' }[
        destination
      ];
      expect(fixture.nativeElement.querySelector('.transition-region').textContent).toContain(
        region,
      );
      expect(
        fixture.nativeElement.querySelector('.region-outline').getAttribute('vector-effect'),
      ).toBe('non-scaling-stroke');
      expect(fixture.nativeElement.querySelector('app-' + destination)).toBeNull();
      expect(transition.overlay() !== null).toBe(source !== 'journey');
      nextFrame(0);
      nextFrame(1500);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.map-stage.fading')).not.toBeNull();
      nextFrame(1850);
      await navigation;
      await fixture.whenStable();
      expect(router.url).toBe(targetUrl);
      expect(fixture.nativeElement.querySelector('app-' + destination)).not.toBeNull();
      expect(transition.overlay()).toBeNull();
      fixture.destroy();
    },
  );

  it('cancels an overlay and ignores its stale completion when navigation changes', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const transition = TestBed.inject(MapTransition);
    const first = transition.play('work');
    const firstId = transition.overlay()!.id;
    transition.complete(firstId, false);
    const second = transition.play('projects');
    const secondId = transition.overlay()!.id;
    transition.complete(firstId, true);
    expect(transition.overlay()?.id).toBe(secondId);
    expect(transition.overlay()?.destination).toBe('projects');
    transition.complete(secondId, true);
    return Promise.all([expect(first).resolves.toBe(false), expect(second).resolves.toBe(true)]);
  });
});
