import type { GameId } from './catalog';

export const SHARE_BASE_URL = 'https://lucasforza.github.io/ImpostorGame/';

export function shareUrl(gameId?: GameId): string {
  const url = new URL(SHARE_BASE_URL);
  if (gameId && gameId !== 'same-wave') url.hash = `game/${gameId}`;
  return url.toString();
}

export type ShareResult = 'shared' | 'copied' | 'manual' | 'cancelled';

type ShareApi = Pick<Navigator, 'share' | 'clipboard'>;

/** Call from the click path so browsers can honor their transient user activation. */
export async function shareLink(
  api: ShareApi,
  url: string,
  title: string,
  copy: (value: string) => Promise<void>,
): Promise<ShareResult> {
  if (typeof api.share === 'function') {
    try {
      await api.share({ title: 'Pocket Circle', text: title, url });
      return 'shared';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await copy(url);
    return 'copied';
  } catch {
    return 'manual';
  }
}

export async function copyToClipboard(api: ShareApi, value: string): Promise<void> {
  if (!api.clipboard?.writeText) throw new Error('Clipboard unavailable');
  await api.clipboard.writeText(value);
}
