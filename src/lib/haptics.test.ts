import { afterEach, describe, expect, it, vi } from 'vitest';
import { haptic, setHapticsEnabled, setNativeHaptics } from './haptics';

/**
 * Der Punkt dieser Datei: `navigator.vibrate` gibt es in iOS-Safari und im
 * WKWebView der nativen Huelle NICHT. Auf dem iPhone lief jeder Aufruf ins
 * Leere, samt dem Schalter in den Einstellungen - lautlos, weil der Aufruf
 * optional ist und der catch den Rest schluckt.
 */
function fakeVibrate() {
  const vibrate = vi.fn(() => true);
  Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true });
  return vibrate;
}

afterEach(() => {
  setNativeHaptics(null);
  setHapticsEnabled(true);
  Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true });
});

describe('Haptik', () => {
  it('nimmt im Browser die Vibration-API', () => {
    const vibrate = fakeVibrate();
    haptic('tap');
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it('nimmt die native Umsetzung, sobald die Hülle sie eingehängt hat', () => {
    const vibrate = fakeVibrate();
    const nativ = vi.fn();
    setNativeHaptics(nativ);
    haptic('success');
    expect(nativ).toHaveBeenCalledWith('success');
    // Nicht beides: auf iOS taete die Web-API ohnehin nichts, auf Android
    // waere es eine doppelte Rueckmeldung.
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('schweigt auf beiden Wegen, wenn der Schalter aus ist', () => {
    // Der Schalter steht in den Einstellungen. Griffe die native Umsetzung
    // daran vorbei, waere er sichtbar wirkungslos.
    const vibrate = fakeVibrate();
    const nativ = vi.fn();
    setNativeHaptics(nativ);
    setHapticsEnabled(false);
    haptic('tap');
    expect(nativ).not.toHaveBeenCalled();
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('stürzt nicht ab, wo es weder das eine noch das andere gibt', () => {
    expect(() => haptic('heavy')).not.toThrow();
  });
});
