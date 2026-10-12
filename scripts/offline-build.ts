import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

type BuildFixture = {
  root: string;
  base: string;
  files?: Map<string, string>;
};

const manifest = {
  id: './',
  name: 'Pocket Circle',
  short_name: 'Pocket Circle',
  description: 'Pass-and-play games for your group.',
  start_url: './',
  scope: './',
  display: 'standalone',
  background_color: '#17121f',
  theme_color: '#17121f',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};

function scopeCachePrefix(base: string): string {
  const scope = base.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9_-]/g, '-') || 'root';
  return `pocket-circle-${scope}-`;
}

function urlFor(base: string, file: string): string {
  return `${base}${file.split('/').map(encodeURIComponent).join('/')}`;
}

export function createServiceWorkerSource(base: string, version: string, assetPaths: string[]): string {
  const cachePrefix = scopeCachePrefix(base);
  const urls = assetPaths.map((file) => urlFor(base, file));
  const shellUrl = urlFor(base, 'index.html');

  return `const CACHE_PREFIX = ${JSON.stringify(cachePrefix)};
const CACHE_NAME = CACHE_PREFIX + ${JSON.stringify(version)};
const SCOPE = ${JSON.stringify(base)};
const SHELL_URL = new URL(${JSON.stringify(shellUrl)}, self.location.origin).href;
const PRECACHE_URLS = ${JSON.stringify(urls)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(async (error) => {
    await caches.delete(CACHE_NAME);
    throw error;
  }));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)),
  )));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;

  if (request.mode === 'navigate') {
    event.respondWith(caches.open(CACHE_NAME).then(async (cache) => {
      const shell = await cache.match(SHELL_URL);
      if (shell) return shell;
      return fetch(request);
    }));
    return;
  }

  event.respondWith(caches.open(CACHE_NAME).then(async (cache) => {
    // Precached files are public and versioned; module Origin headers may differ from installation.
    const cached = await cache.match(request, { ignoreVary: true });
    return cached || fetch(request);
  }));
});
`;
}

async function listFiles(root: string, relative = ''): Promise<string[]> {
  const entries = await fs.readdir(path.join(root, relative), { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const file = path.posix.join(relative, entry.name);
    return entry.isDirectory() ? listFiles(root, file) : [file];
  }));
  return files.flat().sort();
}

async function readBuildFiles({ root, files }: BuildFixture): Promise<Map<string, string>> {
  if (files) return files;
  const paths = await listFiles(root);
  const entries = await Promise.all(paths.map(async (file) => [file, await fs.readFile(path.join(root, file), 'utf8')] as const));
  return new Map(entries);
}

export async function validateOfflineBuild({ root, base, files: fixture }: BuildFixture): Promise<string[]> {
  const files = await readBuildFiles({ root, base, files: fixture });
  const failures: string[] = [];
  const required = ['index.html', 'manifest.webmanifest', 'service-worker.js'];
  for (const file of required) if (!files.has(file)) failures.push(`Missing ${file}`);

  const html = files.get('index.html') ?? '';
  if (!html.includes(`${base}manifest.webmanifest`)) failures.push('Index does not link the scoped web manifest');
  for (const [, href] of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    if (/^(?:[a-z]+:|\/\/|#|data:)/i.test(href) && !href.startsWith(base)) continue;
    const relative = decodeURIComponent(href.startsWith(base) ? href.slice(base.length) : href.replace(/^\.\//, ''));
    const file = path.posix.normalize(path.posix.join(path.posix.dirname('index.html'), relative));
    if (!files.has(file)) failures.push(`Index references missing asset: ${href}`);
  }

  const worker = files.get('service-worker.js') ?? '';
  if (!worker.includes(`const SCOPE = ${JSON.stringify(base)}`)) failures.push('Service worker scope does not match the build base');
  let precache: string[] = [];
  try {
    const precacheJson = worker.match(/const PRECACHE_URLS = (\[[\s\S]*?\]);/)?.[1];
    precache = JSON.parse(precacheJson ?? '[]') as string[];
  } catch {
    failures.push('Service worker precache list is not valid JSON');
  }
  for (const url of precache) {
    const file = decodeURIComponent(url.slice(base.length));
    if (!files.has(file)) failures.push(`Service worker precaches missing asset: ${url}`);
  }
  for (const file of files.keys()) {
    if (file !== 'service-worker.js' && !precache.includes(urlFor(base, file))) {
      failures.push(`Service worker omits emitted asset: ${file}`);
    }
  }

  try {
    const parsed = JSON.parse(files.get('manifest.webmanifest') ?? 'null') as { scope?: string; start_url?: string; icons?: { src?: string }[] } | null;
    if (!parsed || parsed.scope !== './' || parsed.start_url !== './') failures.push('Manifest start_url and scope must be relative');
    for (const icon of parsed?.icons ?? []) {
      const file = path.posix.normalize(path.posix.join(path.posix.dirname('manifest.webmanifest'), icon.src ?? ''));
      if (!files.has(file)) failures.push(`Manifest references missing icon: ${icon.src ?? '(empty)'}`);
    }
  } catch {
    failures.push('Manifest is not valid JSON');
  }
  return failures;
}

export function offlineArtifactsPlugin(base: string, enabled: boolean): Plugin {
  return {
    name: 'pocket-circle-offline-artifacts',
    apply: 'build',
    transformIndexHtml(html) {
      return enabled ? html : html.replace(/<link\b(?=[^>]*\brel=["']manifest["'])[^>]*>\s*/gi, '');
    },
    async closeBundle() {
      if (!enabled) return;
      const outputDirectory = path.resolve('dist');
      await fs.writeFile(path.join(outputDirectory, 'manifest.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);
      const assetPaths = (await listFiles(outputDirectory)).filter((file) => file !== 'service-worker.js');
      const hash = createHash('sha256');
      for (const file of assetPaths) {
        hash.update(file);
        hash.update(await fs.readFile(path.join(outputDirectory, file)));
      }
      const version = hash.digest('hex').slice(0, 16);
      await fs.writeFile(path.join(outputDirectory, 'service-worker.js'), createServiceWorkerSource(base, version, assetPaths));
      const failures = await validateOfflineBuild({ root: outputDirectory, base });
      if (failures.length) throw new Error(`Offline build validation failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
    },
  };
}
