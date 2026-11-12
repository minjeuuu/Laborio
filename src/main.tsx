import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
  onRegisteredSW(_swUrl, r) {
    if (r) {
      setInterval(() => {
        r.update().catch(() => {});
      }, 15000);
    }
  },
});

// Prevent accidental tablet & touch viewport pinch-to-zoom outside designated zoom stages
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Prevent Safari / iPadOS gesture pinch-zoom
  document.addEventListener(
    'gesturestart',
    (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest?.('.allow-pinch-zoom, #print-preview-scroll-stage')) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    'gesturechange',
    (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest?.('.allow-pinch-zoom, #print-preview-scroll-stage')) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    'gestureend',
    (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest?.('.allow-pinch-zoom, #print-preview-scroll-stage')) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Prevent multi-touch pinch on document root (Chrome & Safari on iPad / Android tablets)
  document.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        const target = e.target as HTMLElement | null;
        if (!target?.closest?.('.allow-pinch-zoom, #print-preview-scroll-stage')) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );

  // Multi-touch pinch on document root handled cleanly without blocking standard double-taps
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
