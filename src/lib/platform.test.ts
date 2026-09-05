import { afterEach, describe, expect, it } from 'vitest';
import { isNativeApp } from './platform';

afterEach(() => {
  delete window.Capacitor;
});

describe('isNativeApp', () => {
  it('ist im Browser falsch', () => {
    expect(isNativeApp()).toBe(false);
  });

  it('ist in der nativen Huelle wahr', () => {
    window.Capacitor = { isNativePlatform: () => true };
    expect(isNativeApp()).toBe(true);
  });

  it('bleibt falsch, wenn die Bridge zwar da ist, aber Web meldet', () => {
    window.Capacitor = { isNativePlatform: () => false };
    expect(isNativeApp()).toBe(false);
  });

  it('faellt nicht um, wenn die Bridge unvollstaendig ist', () => {
    window.Capacitor = {};
    expect(isNativeApp()).toBe(false);
  });
});
