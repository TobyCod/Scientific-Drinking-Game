export type Pattern = 'tap' | 'select' | 'success' | 'warn' | 'error' | 'heavy';

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 8,
  select: 12,
  success: [12, 40, 22],
  warn: [24, 60, 24],
  error: [40, 50, 40, 50, 60],
  heavy: 45,
};

let enabled = true;
export function setHapticsEnabled(v: boolean) {
  enabled = v;
}

/**
 * Die native Umsetzung, falls es eine gibt.
 *
 * `navigator.vibrate` existiert in iOS-Safari und im WKWebView der nativen
 * Huelle nicht. Auf dem iPhone liefen deshalb alle Aufrufe ins Leere, samt dem
 * Schalter in den Einstellungen. Die Huelle haengt sich hier ein
 * (`lib/native.ts`), damit dieses Modul nichts von Capacitor wissen muss und
 * der Web-Build kein Byte davon mitschleppt.
 */
let native: ((pattern: Pattern) => void) | null = null;

export function setNativeHaptics(fn: ((pattern: Pattern) => void) | null) {
  native = fn;
}

export function haptic(pattern: Pattern = 'tap') {
  if (!enabled) return;
  if (native) {
    native(pattern);
    return;
  }
  try {
    navigator.vibrate?.(PATTERNS[pattern]);
  } catch {
    /* Wo es die Vibration-API nicht gibt, passiert eben nichts. */
  }
}
