import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Journey } from './journey';
import { journey } from './data/portfolio.data';
describe('Portfolio interactions', () => {
  it('renders professional content without exposing the closed gaming alias', async () => {
    const f = TestBed.createComponent(App);
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain('Hi, I’m Shashi');
    expect(f.nativeElement.textContent).not.toContain('DEVTA');
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
    const f = TestBed.createComponent(App);
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('.journey-controls button').length).toBe(5);
    for (const p of journey.filter((p) => p.experience)) {
      expect(f.nativeElement.querySelector('#' + p.experience)).not.toBeNull();
    }
  });
});
