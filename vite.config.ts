import { defineConfig } from 'vite';
import { offlineArtifactsPlugin } from './scripts/offline-build';

export default defineConfig(({ mode }) => {
  const itch = mode === 'itch';
  const base = itch ? './' : '/ImpostorGame/';
  return {
    base,
    plugins: [offlineArtifactsPlugin(base, !itch)],
  };
});
