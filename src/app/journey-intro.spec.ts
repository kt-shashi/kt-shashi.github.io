import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Journey } from './journey';

describe('Journey landing animation', () => {
  let nextFrame: FrameRequestCallback;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    sessionStorage.removeItem('portfolio-journey-intro');
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      nextFrame = callback;
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    sessionStorage.removeItem('portfolio-journey-intro');
    vi.unstubAllGlobals();
  });

  async function openJourney() {
    const fixture = TestBed.createComponent(Journey);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('starts at Gorakhpur, pulls back, traces all cities, and reveals the introduction', async () => {
    const fixture = await openJourney();
    const component = fixture.componentInstance;
    expect(component.introPlaying()).toBe(true);
    expect(component.camera().x + component.camera().width / 2).toBe(component.places[0].point[0]);
    expect(component.revealedCities()).toBe(1);
    expect(component.introContentVisible()).toBe(false);
    nextFrame(0);
    nextFrame(1350);
    expect(component.camera()).toEqual(component.frame);
    const revealed = [component.revealedCities()];
    for (const time of [1500, 1700, 1900, 2100]) {
      nextFrame(time);
      revealed.push(component.revealedCities());
    }
    expect(revealed).toEqual([...revealed].sort((a, b) => a - b));
    expect(component.revealedCities()).toBe(5);
    expect(component.introRouteProgress()).toBe(1);
    expect(component.introContentVisible()).toBe(true);
    nextFrame(2400);
    fixture.detectChanges();
    expect(component.introPlaying()).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('button.map-label:not([hidden])')).toHaveLength(
      5,
    );
    expect(fixture.nativeElement.querySelectorAll('button.map-label:disabled')).toHaveLength(0);
    fixture.destroy();
  });

  it('does not replay on another visit or after a refresh in the same tab', async () => {
    sessionStorage.setItem('portfolio-journey-intro', 'played');
    const fixture = await openJourney();
    expect(fixture.componentInstance.introPlaying()).toBe(false);
    expect(fixture.componentInstance.camera()).toEqual(fixture.componentInstance.frame);
    fixture.destroy();
  });

  it('shows the finished page immediately with reduced motion', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const fixture = await openJourney();
    expect(fixture.componentInstance.introPlaying()).toBe(false);
    expect(fixture.componentInstance.revealedCities()).toBe(5);
    expect(fixture.componentInstance.introContentVisible()).toBe(true);
    fixture.destroy();
  });

  it('finishes immediately when Escape is pressed', async () => {
    const fixture = await openJourney();
    fixture.componentInstance.close();
    expect(fixture.componentInstance.introPlaying()).toBe(false);
    expect(fixture.componentInstance.camera()).toEqual(fixture.componentInstance.frame);
    fixture.destroy();
  });

  it('hands the current camera to a section transition when navigation interrupts the splash', async () => {
    const fixture = await openJourney();
    const component = fixture.componentInstance;
    const camera = component.camera();
    const navigation = component.transitionTo('education');
    expect(component.introPlaying()).toBe(false);
    expect(component.departing()).toBe(true);
    expect(component.camera()).toEqual(camera);
    nextFrame(0);
    nextFrame(1850);
    await expect(navigation).resolves.toBe(true);
    fixture.destroy();
  });
});
