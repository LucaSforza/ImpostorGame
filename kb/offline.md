# Offline use and itch.io builds

The GitHub Pages build registers a same-origin service worker at `/ImpostorGame/`. Its install step precaches every emitted file, including the shell, JavaScript, styles, artwork, manifest, and icons. The cache name includes a digest of every precached path and file, so a partially downloaded release cannot become the active cache.

The worker serves the current cached shell for in-scope navigations and serves precached assets by URL. It does not intercept cross-origin requests, non-GET requests, or paths outside its scope. A first visit still needs a network connection to download the app and finish installation. The app reports offline readiness through the `data-offline-status` attribute and the `pocket-circle:offline-status` event; it does not show a blocking prompt.

Updates wait until pages using the old worker have closed. The new worker then removes only older Pocket Circle caches for the same repository scope. It does not claim open pages, force a reload, or touch IndexedDB. Saved profiles, settings, statistics, and active sessions remain origin-local browser data.

`npm run build` creates the GitHub Pages release. `npm run build:itch` creates a relative-path build in `dist-itch/`; it omits the web manifest and service worker because itch.io may frame games under changing paths. `npm run package:itch` also adds the AGPL license and source repository notice, then creates `dist-itch.zip` with the system `zip` utility. This packages files locally and does not publish them.
