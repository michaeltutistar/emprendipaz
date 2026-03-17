export function isInstalledPwa() {
  try {
    // Standard (Chrome/Android/Desktop)
    const standaloneMatch =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches;

    // iOS Safari legacy
    const iosStandalone =
      typeof navigator !== 'undefined' &&
      navigator.standalone === true;

    // Android TWA / some install contexts
    const androidAppReferrer =
      typeof document !== 'undefined' &&
      typeof document.referrer === 'string' &&
      document.referrer.startsWith('android-app://');

    return Boolean(standaloneMatch || iosStandalone || androidAppReferrer);
  } catch {
    return false;
  }
}

