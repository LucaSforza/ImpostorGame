import { describe, expect, it } from 'vitest';
import { createServiceWorkerSource, validateOfflineBuild } from '../scripts/offline-build';

describe('offline build artifacts', () => {
  it('creates an atomic, scope-local precache worker with a content version', () => {
    const source = createServiceWorkerSource('/ImpostorGame/', 'abc123', [
      'index.html',
      'assets/app-a1.js',
      'assets/app-a1.css',
    ]);

    expect(source).toContain('const CACHE_PREFIX = "pocket-circle-ImpostorGame-";');
    expect(source).toContain('const SCOPE = "/ImpostorGame/";');
    expect(source).toContain("cache.addAll(PRECACHE_URLS)");
    expect(source).not.toContain('skipWaiting');
    expect(source).toContain('caches.keys()');
    expect(source).toContain("request.mode === 'navigate'");
    expect(source).not.toContain('cache.put(');
    expect(source).not.toContain('clients.claim');
    expect(source).toContain('assets/app-a1.js');
  });

  it('checks Pages asset paths and manifest icons against the built directory', async () => {
    const failures = await validateOfflineBuild({
      root: '/tmp/pocket-circle-offline-fixture',
      base: '/ImpostorGame/',
      files: new Map([
        ['index.html', '<link rel="manifest" href="/ImpostorGame/manifest.webmanifest">'],
        ['manifest.webmanifest', JSON.stringify({ scope: './', start_url: './', icons: [{ src: 'icons/app-192.png' }] })],
        ['service-worker.js', 'const SCOPE = "/ImpostorGame/"; const PRECACHE_URLS = ["/ImpostorGame/index.html", "/ImpostorGame/manifest.webmanifest", "/ImpostorGame/icons/app-192.png"];'],
        ['icons/app-192.png', 'png'],
      ]),
    });

    expect(failures).toEqual([]);
  });
});
