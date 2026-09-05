import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Verpackt den fertigen Vite-Build als native App.
 *
 * Die Kennung `app.pegel.party` traegt bewusst keinen Personennamen: sie ist
 * nach der ersten Veroeffentlichung unveraenderlich, waehrend noch offen ist,
 * wer die App spaeter im Store fuehrt.
 *
 * Gebaut wird mit VITE_BASE=/ (siehe `npm run build:native`) – der Standard
 * `/Scientific-Drinking-Game/` ist der Unterpfad von GitHub Pages und waere
 * im Container ein toter Pfad.
 */
const config: CapacitorConfig = {
  appId: 'app.pegel.party',
  appName: 'Pegel',
  webDir: 'dist',
  // Gleiche Farbe wie `theme-color` in index.html. Ohne das blitzt beim Start
  // kurz Weiss auf, bevor die dunkle App-Oberflaeche steht.
  backgroundColor: '#08080B',
  ios: {
    // Die App zeichnet ihre eigenen Abstaende (safe-area-inset in tokens.css);
    // WebKit soll nichts zusaetzlich einruecken.
    contentInset: 'never',
    backgroundColor: '#08080B',
  },
};

export default config;
