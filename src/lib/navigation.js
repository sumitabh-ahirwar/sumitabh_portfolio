import { scrollToTarget } from './scroll';

/** Scroll to a section, keep the URL hash in sync (so refresh returns here), and move focus for keyboard users. */
export function navigateTo(id) {
  scrollToTarget(id);
  try {
    history.replaceState(null, '', id === 'top' ? location.pathname : `#${id}`);
  } catch {
    /* ignore */
  }
  const el = document.getElementById(id);
  if (el) el.focus({ preventScroll: true });
}
