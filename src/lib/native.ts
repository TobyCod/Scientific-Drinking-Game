import { setNativeHaptics, type Pattern } from './haptics';
import { isNativeApp } from './platform';

/**
 * Alles, was nur in der nativen Hülle läuft.
 *
 * Durchweg dynamische Importe. Der Web-Build soll kein Byte von Capacitor
 * mitschleppen — dieselbe Überlegung wie in `platform.ts`. Jeder Teil ist
 * einzeln abgesichert: nichts davon ist zum Spielen nötig, ein Ausfall darf
 * den Start nicht anhalten.
 */
export async function initNative(): Promise<void> {
  if (!isNativeApp()) return;
  await Promise.allSettled([haptics()]);
}

/**
 * iOS kennt keine Vibrationsmuster wie Android, sondern benannte Rückmeldungen
 * der Taptic Engine. Deshalb eine Zuordnung statt einer Übersetzung der
 * Millisekunden-Muster.
 */
async function haptics(): Promise<void> {
  const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
  const run = (p: Promise<void>) => void p.catch(() => {});
  const byPattern: Record<Pattern, () => void> = {
    tap: () => run(Haptics.impact({ style: ImpactStyle.Light })),
    select: () => run(Haptics.selectionChanged()),
    success: () => run(Haptics.notification({ type: NotificationType.Success })),
    warn: () => run(Haptics.notification({ type: NotificationType.Warning })),
    error: () => run(Haptics.notification({ type: NotificationType.Error })),
    heavy: () => run(Haptics.impact({ style: ImpactStyle.Heavy })),
  };
  setNativeHaptics((pattern) => byPattern[pattern]());
}
