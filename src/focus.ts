export type FocusSnapshot = { key: string; start?: number | null; end?: number | null } | null;

function focusKey(element: HTMLElement): string | null {
  if (element.id) return `#${element.id}`;
  const action = element.dataset.action;
  if (action) return JSON.stringify(['action', action, element.dataset.player, element.dataset.avatar, element.dataset.game, element.dataset.category, element.dataset.bombCategory, element.dataset.accuse]);
  const [attribute, value] = ['player', 'avatar', 'game', 'category', 'bombCategory', 'accuse']
    .map(key => [key, element.dataset[key]] as const).find(([, item]) => item !== undefined) ?? [];
  if (!attribute || value === undefined) return null;
  return JSON.stringify([attribute, value]);
}

export function captureFocus(root: ParentNode): FocusSnapshot {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement) || !root.contains(active)) return null;
  const key = focusKey(active);
  if (!key) return null;
  const field = active as HTMLInputElement;
  return { key, start: field.selectionStart, end: field.selectionEnd };
}

export function restoreFocus(root: ParentNode, snapshot: FocusSnapshot): boolean {
  if (!snapshot) return false;
  const target = snapshot.key.startsWith('#')
    ? root.querySelector<HTMLElement>(snapshot.key)
    : [...root.querySelectorAll<HTMLElement>('button, input, select, textarea')].find(element => focusKey(element) === snapshot.key) ?? null;
  if (!target || target.matches(':disabled')) return false;
  target.focus({ preventScroll: true });
  if (target instanceof HTMLInputElement && snapshot.start !== null && snapshot.start !== undefined && snapshot.end !== null && snapshot.end !== undefined) {
    target.setSelectionRange(snapshot.start, snapshot.end);
  }
  return document.activeElement === target;
}
