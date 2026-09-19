export type AppScreen = 'catalog' | 'setup' | 'stats';

export function screenFromHash(hash: string): AppScreen {
  if (hash === '#stats') return 'stats';
  if (hash === '#setup') return 'setup';
  return 'catalog';
}
