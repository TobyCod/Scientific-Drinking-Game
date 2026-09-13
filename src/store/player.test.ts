import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PAUSE_MS, closeStaleNight, usePlayer } from './player';
import { findDrink } from '../engine/drinks';
import { makeDrinkEvent } from '../engine/sips';

/** `removeEvent` nimmt einen bestimmten Eintrag – nicht den letzten wie `undoLast`. */
describe('removeEvent', () => {
  beforeEach(() => {
    usePlayer.setState({ log: [], nightStartedAt: null });
  });

  it('entfernt genau den Eintrag mit dieser Kennung, auch mitten im Log', () => {
    const pils = findDrink('beer-pils');
    const a = makeDrinkEvent(pils, 1, 'glas', 1);
    const b = makeDrinkEvent(pils, 2, 'glas', 2);
    const c = makeDrinkEvent(pils, 3, 'glas', 3);
    usePlayer.setState({ log: [a, b, c] });

    usePlayer.getState().removeEvent(b.id);

    expect(usePlayer.getState().log.map((e) => e.sips)).toEqual([1, 3]);
  });
});

/** Zwei Abende trennt eine Pause – nicht erst die 14-Stunden-Grenze. */
describe('Pause trennt Abende', () => {
  const H = 3_600_000;
  const vormittag = new Date(2026, 8, 12, 11, 0, 0).getTime();

  beforeEach(() => {
    usePlayer.setState({ log: [], nightStartedAt: null, lastActiveAt: null });
  });
  afterEach(() => vi.useRealTimers());

  it('ein Spiel am Vormittag und ein Getränk am Abend sind zwei Abende', () => {
    vi.useFakeTimers();
    vi.setSystemTime(vormittag);
    usePlayer.getState().beginNight();
    vi.setSystemTime(vormittag + 9 * H);
    usePlayer.getState().logEvent(makeDrinkEvent(findDrink('beer-pils', []), 3));
    expect(usePlayer.getState().nightStartedAt).toBe(vormittag + 9 * H);
    expect(usePlayer.getState().log).toHaveLength(1);
  });

  it('innerhalb der Pause bleibt es derselbe Abend', () => {
    vi.useFakeTimers();
    vi.setSystemTime(vormittag);
    usePlayer.getState().beginNight();
    vi.setSystemTime(vormittag + PAUSE_MS - 1000);
    usePlayer.getState().beginNight();
    vi.setSystemTime(vormittag + 2 * PAUSE_MS - 2000);
    usePlayer.getState().beginNight();
    expect(usePlayer.getState().nightStartedAt).toBe(vormittag);
  });

  it('schließt einen pausierten Abend auch beim Start der App', () => {
    usePlayer.setState({ nightStartedAt: vormittag, lastActiveAt: vormittag });
    closeStaleNight(usePlayer.getState(), vormittag + PAUSE_MS + 1);
    expect(usePlayer.getState().nightStartedAt).toBeNull();
  });
});
