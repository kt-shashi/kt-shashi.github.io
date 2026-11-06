import { TestBed } from '@angular/core/testing';
import { Journey } from './journey';
import { provideRouter } from '@angular/router';

describe('Journey map transitions', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  afterEach(() => vi.unstubAllGlobals());

  it.each(['work', 'projects', 'education'] as const)(
    'zooms the home map toward %s then fades before navigation',
    async (destination) => {
      vi.stubGlobal('matchMedia', () => ({ matches: false }));
      let nextFrame: FrameRequestCallback = () => {};
      vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
        nextFrame = callback;
        return 1;
      });
      vi.stubGlobal('cancelAnimationFrame', vi.fn());
      const fixture = TestBed.createComponent(Journey);
      const journey = fixture.componentInstance;
      const proceed = journey.transitionTo(destination);
      expect(journey.highlightedRegion()?.name).toBe(
        { work: 'Maharashtra', projects: 'Jharkhand', education: 'West Bengal' }[destination],
      );
      expect(journey.highlightedRegion()?.path).toMatch(/^M/);
      expect(journey.camera()).toEqual(journey.frame);
      nextFrame(0);
      nextFrame(825);
      expect(journey.camera().x + journey.camera().width / 2).toBe(610);
      const city = { work: null, projects: 'jamshedpur', education: 'kolkata' }[destination];
      const target = city ? journey.places.find((place) => place.id === city)!.point : [330, 566];
      expect(journey.camera().y + journey.camera().height / 2).toBeCloseTo(target[1]);
      nextFrame(1500);
      expect(journey.camera().width).toBe(200);
      expect(journey.camera().x + 100).toBeCloseTo(target[0]);
      expect(journey.camera().y + 67).toBeCloseTo(target[1]);
      expect(journey.mapFading()).toBe(true);
      nextFrame(1850);
      await expect(proceed).resolves.toBe(true);
      fixture.destroy();
    },
  );

  it('resets the home map when the user chooses another destination mid-transition', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 1),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const fixture = TestBed.createComponent(Journey);
    const journey = fixture.componentInstance;
    const proceed = journey.transitionTo('work');
    journey.cancelMapTransition();
    await expect(proceed).resolves.toBe(false);
    expect(journey.departing()).toBe(false);
    expect(journey.highlightedRegion()).toBeNull();
    expect(journey.camera()).toEqual(journey.frame);
    fixture.destroy();
  });

  it('navigates immediately with reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const fixture = TestBed.createComponent(Journey);
    expect(fixture.componentInstance.transitionTo('work')).toBe(true);
    expect(fixture.componentInstance.departing()).toBe(false);
    fixture.destroy();
  });
});
