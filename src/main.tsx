import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { UpdateBanner } from './app/UpdateBanner';
import { initNative } from './lib/native';
import './styles/global.css';
import './styles/game.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <UpdateBanner />
  </StrictMode>,
);

// Nach dem Rendern: im Browser kehrt das sofort zurueck, in der nativen
// Huelle laedt es die Plugins nach. Kein `await` - der Start haengt nicht
// daran, und ein Fehler darf die App nicht aufhalten.
void initNative();
