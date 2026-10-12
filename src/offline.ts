type OfflineStatus = 'ready' | 'unavailable';

function publishStatus(status: OfflineStatus): void {
  document.documentElement.dataset.offlineStatus = status;
  document.dispatchEvent(new CustomEvent('pocket-circle:offline-status', { detail: { status } }));
}

export function registerOffline(): void {
  const base = import.meta.env.BASE_URL;
  if (!import.meta.env.PROD || base === './' || !('serviceWorker' in navigator)) return;

  void navigator.serviceWorker.register(`${base}service-worker.js`, { scope: base, updateViaCache: 'none' })
    .then(() => navigator.serviceWorker.ready)
    .then(() => publishStatus('ready'))
    .catch((error: unknown) => {
      console.warn('Offline support could not be enabled.', error);
      publishStatus('unavailable');
    });
}
