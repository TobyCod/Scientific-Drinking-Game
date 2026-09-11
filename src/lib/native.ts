import { isNativeApp } from './platform';
import { useApp } from '../store/app';

/**
 * Alles, was nur in der nativen Hülle läuft: Statusleiste zum Thema,
 * Startbild und die Brücke für die Rückkehr aus dem Hintergrund. Die Haptik
 * lädt ihr Plugin selbst (`lib/haptics.ts`).
 *
 * Durchweg dynamische Importe. Der Web-Build soll kein Byte von Capacitor
 * mitschleppen — dieselbe Überlegung wie in `platform.ts`. Jeder Teil ist
 * einzeln abgesichert: nichts davon ist zum Spielen nötig, ein Ausfall darf
 * den Start nicht anhalten.
 */
export async function initNative(): Promise<void> {
  if (!isNativeApp()) return;
  await Promise.allSettled([statusBar(), lifecycle()]);
  // Zuletzt und unabhaengig vom Rest: erst wenn die Oberflaeche steht, geht
  // das Startbild weg. Faellt oben etwas aus, passiert das hier trotzdem.
  await splashDone();
}

/**
 * Statusleiste am Thema der App, nicht am System: wer im Dunkelmodus der App
 * auf hell umstellt, bekäme sonst hellen Text auf hellem Grund.
 *
 * `Style.Dark` heißt in diesem Plugin „heller Text für dunklen Hintergrund"
 * — die Benennung geht vom Erscheinungsbild aus, nicht von der Schriftfarbe.
 */
async function statusBar(): Promise<void> {
  const { StatusBar, Style } = await import('@capacitor/status-bar');
  const apply = (theme: 'dark' | 'light') =>
    void StatusBar.setStyle({ style: theme === 'light' ? Style.Light : Style.Dark }).catch(
      () => {},
    );
  apply(useApp.getState().theme);
  useApp.subscribe((state) => apply(state.theme));
}

/**
 * Der Pegel (`useLiveBac`) und die Bildschirmsperre (`lib/wakelock`) hängen
 * beide an `visibilitychange`. Ob der WKWebView das beim App-Wechsel von sich
 * aus feuert, ist nirgends zugesichert; diese Brücke macht es unabhängig
 * davon verlässlich. Beide Empfänger vertragen ein doppeltes Ereignis.
 */
async function lifecycle(): Promise<void> {
  const { App } = await import('@capacitor/app');
  await App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) document.dispatchEvent(new Event('visibilitychange'));
  });
}

async function splashDone(): Promise<void> {
  const { SplashScreen } = await import('@capacitor/splash-screen');
  await SplashScreen.hide().catch(() => {});
}
