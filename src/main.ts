import './style.css';
import { emptyPlayerStats, loadData, saveData, type AppData, type Player, type PlayerStats } from './db';
import { createGame, localizeEntry, maxAttempts, maxImpostors, citizensWin, recordGameResult, type Game } from './game';
import { categoryDescription, categoryLabel, translate, type MessageKey, type MessageParams } from './i18n';
import { categories, normalizeCategorySelection, selectedCategoryIds, type CategoryId, type SelectableCategoryId } from './words';
import avatar01 from './assets/avatars/avatar-01.webp';
import avatar02 from './assets/avatars/avatar-02.webp';
import avatar03 from './assets/avatars/avatar-03.webp';
import avatar04 from './assets/avatars/avatar-04.webp';
import avatar05 from './assets/avatars/avatar-05.webp';
import avatar06 from './assets/avatars/avatar-06.webp';
import avatar07 from './assets/avatars/avatar-07.webp';
import avatar08 from './assets/avatars/avatar-08.webp';
import avatar09 from './assets/avatars/avatar-09.webp';
import avatar10 from './assets/avatars/avatar-10.webp';
import avatar11 from './assets/avatars/avatar-11.webp';
import avatar12 from './assets/avatars/avatar-12.webp';
import avatar13 from './assets/avatars/avatar-13.webp';
import avatar14 from './assets/avatars/avatar-14.webp';
import avatar15 from './assets/avatars/avatar-15.webp';
import avatar16 from './assets/avatars/avatar-16.webp';
import foodImage from './assets/categories/food.webp';
import placesImage from './assets/categories/places.webp';
import objectsImage from './assets/categories/objects.webp';
import animalsImage from './assets/categories/animals.webp';
import sportImage from './assets/categories/sport.webp';
import cinemaImage from './assets/categories/cinema.webp';
import slangImage from './assets/categories/slang-giovanile.webp';
import boomerImage from './assets/categories/parole-boomer.webp';
import datingImage from './assets/categories/dating.webp';
import redFlagsImage from './assets/categories/red-flags.webp';
import trendImage from './assets/categories/trend.webp';
import partyChaosImage from './assets/categories/festa-e-caos.webp';
import spicyPersonalImage from './assets/categories/piccante-e-personale.webp';
import filmImage from './assets/categories/film.webp';
import hobbyImage from './assets/categories/hobby.webp';

const root = document.querySelector<HTMLDivElement>('#app')!;
const avatars = [
  ['avatar-01', 'Cometa', avatar01], ['avatar-02', 'Ribelle', avatar02], ['avatar-03', 'Lampo', avatar03], ['avatar-04', 'Nebbia', avatar04],
  ['avatar-05', 'Braciere', avatar05], ['avatar-06', 'Marea', avatar06], ['avatar-07', 'Cobalto', avatar07], ['avatar-08', 'Corallo', avatar08],
  ['avatar-09', 'Guscio', avatar09], ['avatar-10', 'Piuma', avatar10], ['avatar-11', 'Ombra', avatar11], ['avatar-12', 'Pixel', avatar12],
  ['avatar-13', 'Zefiro', avatar13], ['avatar-14', 'Radice', avatar14], ['avatar-15', 'Prisma', avatar15], ['avatar-16', 'Turbine', avatar16],
] as const;
type AvatarId = typeof avatars[number][0];
const categoryImages: Record<SelectableCategoryId, string> = {
  food: foodImage,
  places: placesImage,
  objects: objectsImage,
  animals: animalsImage,
  sport: sportImage,
  cinema: cinemaImage,
  slang: slangImage,
  boomer: boomerImage,
  dating: datingImage,
  red_flags: redFlagsImage,
  trend: trendImage,
  party_chaos: partyChaosImage,
  spicy_personal: spicyPersonalImage,
  film: filmImage,
  hobby: hobbyImage,
};
const legacyAvatarMap: Record<string, AvatarId> = {
  '😎': 'avatar-01', '👽': 'avatar-02', '🦊': 'avatar-03', '👻': 'avatar-04',
  '🐸': 'avatar-05', '🤖': 'avatar-06', '🐼': 'avatar-07', '🦄': 'avatar-08',
  '🐙': 'avatar-09', '🔥': 'avatar-10', '🐱': 'avatar-11', '🕵️': 'avatar-12',
};
let data: AppData<Game> = { players: [], selectedIds: [], settings: { impostors: 1, maxAttempts: 1, category: 'all' }, activeGame: null, language: 'it' };
let revealed = false;
let busy = false;
let storageReady = false;
let error = '';
let categoryScreen = false;
let dialog: 'player' | 'rules' | 'exit' | 'delete' | null = null;
let chosenAvatar: string = avatars[0][0];
let draftName = '';
let draftStats: PlayerStats = emptyPlayerStats();
let editingPlayerId: string | null = null;
let deletingPlayerId: string | null = null;
let photoError = '';
const t = (key: MessageKey, params?: MessageParams) => translate(data.language, key, params);
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const categoryName = (c: CategoryId) => categoryLabel(data.language, c);
const selected = () => data.players.filter(p => data.selectedIds.includes(p.id));
const button = (action: string, label: string, cls = 'primary', disabled = false, ariaLabel = '') => `<button class="${cls}" data-action="${action}" ${ariaLabel ? `aria-label="${escape(ariaLabel)}"` : ''} ${disabled || busy ? 'disabled' : ''}>${label}</button>`;
const resolveAvatar = (value: string): AvatarId => avatars.find(([id]) => id === value)?.[0] ?? legacyAvatarMap[value] ?? avatars[0][0];
const isPhotoAvatar = (value: string) => value.startsWith('data:image/');
const avatarSource = (value: string) => avatars.find(([id]) => id === resolveAvatar(value))![2];
const avatarMarkup = (value: string, size = '') => {
  const photo = isPhotoAvatar(value);
  return `<span class="avatar ${size}${photo ? ' photo' : ''}" aria-hidden="true"><img class="avatar-image" src="${escape(photo ? value : avatarSource(value))}" alt=""/></span>`;
};
const avatar = (p: Player, size = '') => avatarMarkup(p.avatar, size);
const avatarArt = (value: string) => {
  const photo = isPhotoAvatar(value);
  return `<img class="character-art${photo ? ' photo' : ''}" src="${escape(photo ? value : avatarSource(value))}" alt=""/>`;
};

function playerStatsSummary(player: Player): string {
  const stats = player.stats ?? emptyPlayerStats();
  const wins = stats.citizenWins + stats.impostorWins;
  const rate = stats.gamesPlayed ? (wins / stats.gamesPlayed) * 100 : 0;
  const formattedRate = new Intl.NumberFormat(data.language, { maximumFractionDigits: 1 }).format(rate);
  return t('stats.summary', { played: stats.gamesPlayed, rate: formattedRate });
}

function playerCard(p: Player): string {
  const included = data.selectedIds.includes(p.id);
  const disabled = busy || !storageReady;
  return `<div class="player-row"><button class="player ${included ? 'selected' : ''}" data-player="${p.id}" aria-pressed="${included}" ${disabled ? 'disabled' : ''}>${avatar(p)}<span class="player-copy"><span class="player-name">${escape(p.name)}</span><span class="player-stats">${playerStatsSummary(p)}</span></span><span class="check" aria-hidden="true">${included ? '✓' : '+'}</span></button><div class="player-actions"><button type="button" class="player-action" data-action="edit-player" data-player="${p.id}" aria-label="${t('action.edit')} ${escape(p.name)}" ${disabled ? 'disabled' : ''}>${t('action.edit')}</button><button type="button" class="player-action danger" data-action="delete-player" data-player="${p.id}" aria-label="${t('action.delete')} ${escape(p.name)}" ${disabled ? 'disabled' : ''}>${t('action.delete')}</button></div></div>`;
}

async function change(update: (next: AppData<Game>) => void): Promise<void> {
  if (busy || !storageReady) return;
  busy = true;
  root.querySelectorAll<HTMLButtonElement | HTMLSelectElement>('button, select').forEach(control => { control.disabled = true; });
  const next = structuredClone(data);
  try {
    update(next);
    await saveData(next);
    data = next;
    error = '';
  } catch {
    error = t('error.save');
  } finally { busy = false; render(); }
}

function categoryCard(category: 'all' | SelectableCategoryId): string {
  const selection = normalizeCategorySelection(data.settings.category);
  const selected = category === 'all'
    ? selection === 'all'
    : selection !== 'all' && (selectedCategoryIds(selection) ?? []).includes(category);
  const art = category === 'all'
    ? '<span class="category-all-art" aria-hidden="true">✦</span>'
    : `<img src="${categoryImages[category]}" alt=""/>`;
  const label = category === 'all' ? categoryName('all') : categoryName(category);
  const description = category === 'all' ? t('category.description.all') : categoryDescription(data.language, category);
  return `<button type="button" class="category-card ${selected ? 'selected' : ''}" data-category="${category}" aria-pressed="${selected}" ${busy ? 'disabled' : ''}>${art}<span class="category-card-copy"><strong>${label}</strong><small>${description}</small></span><span class="category-card-check" aria-hidden="true">${selected ? '✓' : '+'}</span></button>`;
}

function categoryPicker(): string {
  const selection = normalizeCategorySelection(data.settings.category);
  const selectedCount = selection === 'all' ? categories.length : (selectedCategoryIds(selection) ?? []).length;
  const summaryKey = selection === 'all' ? 'category.selectedAll' : selectedCount === 1 ? 'category.selectedOne' : 'category.selectedMany';
  return `<p class="category-hint">${t('category.selectHint')}</p><div class="category-picker" role="group" aria-label="${t('deck.title')}">${categoryCard('all')}${categories.map(categoryCard).join('')}</div><p class="category-summary">${t(summaryKey, { count: selectedCount })}</p>`;
}

function categorySelectionSummary(): string {
  const selection = normalizeCategorySelection(data.settings.category);
  const count = selection === 'all' ? categories.length : (selectedCategoryIds(selection) ?? []).length;
  const key = selection === 'all' ? 'category.selectedAll' : count === 1 ? 'category.selectedOne' : 'category.selectedMany';
  return t(key, { count });
}

function categoryScreenView(): string {
  return `<section class="category-screen"><div class="category-screen-head"><button class="category-screen-back" data-action="close-categories" aria-label="${t('category.back')}">←</button><div><span class="eyebrow">${t('category.eyebrow')}</span><h1>${t('category.title')}</h1></div></div>${categoryPicker()}${button('close-categories', `${t('category.done')} <span>✓</span>`)}</section>`;
}

function setup(): string {
  const count = data.selectedIds.length;
  const attemptLimit = maxAttempts(count, data.settings.impostors);
  const attempts = Math.min(data.settings.maxAttempts, attemptLimit);
  return `<section class="cover"><div class="cover-art"></div><div class="cover-copy"><span class="eyebrow">${t('cover.eyebrow')}</span><h1>${t('cover.title')}</h1><p>${t('cover.subtitle')}</p></div><span class="cover-tag">${t('cover.tag')}</span><span class="spark">✦</span></section>
  <section class="setup"><div class="section-heading"><div><span class="eyebrow">${t('setup.eyebrow')}</span><h2>${t('setup.title')}</h2></div><span class="count">${count}/20</span></div>
  ${data.players.length ? `<p class="helper">${t('setup.helper')}</p><div class="players">${data.players.map(playerCard).join('')}</div>` : `<div class="empty"><span>✦</span><p>${t('setup.empty')}</p></div>`}
  ${button('add', `＋ ${t('player.new')}`, 'secondary', !storageReady)}
  <div class="setting"><div><strong>${t('game.impostors')}</strong><small>${t('game.impostorHint')}</small></div><div class="stepper"><button data-action="minus" aria-label="${t('game.fewerImpostors')}" ${data.settings.impostors <= 1 || busy ? 'disabled' : ''}>−</button><b>${data.settings.impostors}</b><button data-action="plus" aria-label="${t('game.moreImpostors')}" ${data.settings.impostors >= maxImpostors(count) || busy ? 'disabled' : ''}>+</button></div></div>
  <div class="setting"><div><strong>${t('game.attempts')}</strong><small>${t('game.attemptsHint', { max: attemptLimit })}</small></div><div class="stepper"><button data-action="attempt-minus" aria-label="${t('game.fewerAttempts')}" ${attempts <= 1 || busy ? 'disabled' : ''}>−</button><b>${attempts}</b><button data-action="attempt-plus" aria-label="${t('game.moreAttempts')}" ${attempts >= attemptLimit || busy ? 'disabled' : ''}>+</button></div></div>
  <div class="setting category-setting"><div class="category-setting-copy"><strong>${t('deck.title')}</strong><small>${t('deck.subtitle')}</small><span>${categorySelectionSummary()}</span></div>${button('open-categories', `${t('category.change')} <span>→</span>`, 'category-open')}</div>
  ${button('start', `${t('game.start')} <span>↗</span>`, 'primary', count < 3 || !storageReady)}
  <p class="footnote">${count < 3 ? t(3 - count === 1 ? 'setup.morePlayersOne' : 'setup.morePlayersMany', { count: 3 - count }) : t('setup.passSecrets')}</p></section>`;
}

function gameView(g: Game): string {
  const p = g.players[g.revealIndex];
  const { word: gameWord, hint } = localizeEntry(g.entry, data.language);
  const phaseLabel = { reveal: t('game.phase.reveal'), discuss: t('game.phase.discuss'), vote: t('game.phase.vote'), result: t('game.phase.result') }[g.phase];
  const top = `<div class="round-top">${button('exit', '←', 'icon-btn')}<span class="eyebrow">${phaseLabel}</span><span class="count">${g.players.length} ${t('game.friends')}</span></div>`;
  if (g.phase === 'reveal') {
    const impostor = g.impostorIds.includes(p.id);
    return `<div class="game-logo"><span>${t('game.logo.find')}</span><strong>${t('game.logo.impostor')}</strong></div>${top}<div class="progress" aria-label="${g.revealIndex + 1}/${g.players.length}">${g.players.map((_, i) => `<i class="${i <= g.revealIndex ? 'done' : ''}"></i>`).join('')}</div><section class="game-screen"><p class="eyebrow">${t('game.passPhoneTo')}</p><h1 class="player-title">${escape(p.name)}</h1><p class="helper">${t('game.noPeeking')}</p><div id="secret-card" class="secret-card ${revealed ? 'flipped' : ''}">${revealed ? `<span class="role-label">${impostor ? t('game.impostorRole') : t('game.crewRole')}</span><span class="secret-icon">${impostor ? '🕵️' : '🤫'}</span><p>${impostor ? t('game.yourHint') : t('game.secretWord')}</p><h2 class="secret-word">${escape(impostor ? hint : gameWord)}</h2><p class="helper">${impostor ? t('game.impostorInstruction') : t('game.crewInstruction')}</p>` : `${avatarArt(p.avatar)}<div class="swipe-prompt"><span>↑</span><b>${t('game.swipeReveal')}</b><small>${t('game.revealButtonHint')}</small></div>`}</div>${revealed ? button('next', `${t('game.hideAndPass')} <span>→</span>`) : button('reveal', `${t('game.iAm')} ${escape(p.name)} · ${t('game.reveal')} <span>◈</span>`)}<p class="footnote">${g.revealIndex + 1} ${t('game.of')} ${g.players.length} · ${t('game.appHidesSecret')}</p></section>`;
  }
  if (g.phase === 'discuss') {
    const starter = g.players.find(x => x.id === g.starterId)!;
    const attemptNotice = g.attemptsUsed > 0 ? `<div class="attempt-notice">${t(g.maxAttempts - g.attemptsUsed === 1 ? 'game.attemptFailedOne' : 'game.attemptFailedMany', { used: g.attemptsUsed, remaining: g.maxAttempts - g.attemptsUsed })}</div>` : '';
    return `${top}<section class="game-screen">${attemptNotice}<span class="big-symbol">✦</span><h1>${t('game.discuss.title')}</h1><p class="helper">${t('game.discuss.subtitle')}</p><div class="starter">${avatar(starter)}<div><small>${t('game.breaksIce')}</small><strong>${escape(starter.name)}</strong></div></div><div class="tip"><b>${t('game.askQuestions')}</b><p>${t('game.discuss.tip')}</p></div>${button('vote', `${t('game.vote')} <span>→</span>`)}</section>`;
  }
  if (g.phase === 'vote') return `${top}<section class="game-screen"><p class="eyebrow">${t('game.vote.trust')}</p><h1>${t('game.vote.title')}</h1><p class="attempt-status">${t('game.attemptStatus', { used: g.attemptsUsed + 1, max: g.maxAttempts })}</p><p class="helper">${t(g.impostorIds.length === 1 ? 'game.vote.helperOne' : 'game.vote.helperMany', { count: g.impostorIds.length })}</p><div class="players vote-players">${g.players.map(p => `<button class="player ${g.accusedIds.includes(p.id) ? 'selected' : ''}" data-accuse="${p.id}" aria-pressed="${g.accusedIds.includes(p.id)}">${avatar(p)}<span>${escape(p.name)}</span><span class="check">${g.accusedIds.includes(p.id) ? '✓' : '+'}</span></button>`).join('')}</div>${button('result', `${t('game.revealTruth')} <span>✦</span>`, 'primary', g.accusedIds.length !== g.impostorIds.length)}${button('discuss', t('game.backToDiscussion'), 'text-btn')}</section>`;
  return `${top}<section class="game-screen result"><div class="confetti" aria-hidden="true">✦ · ✧ · ✦</div><span class="big-symbol">${citizensWin(g) ? '🏆' : '🕵️'}</span><p class="eyebrow">${t('game.result.masksOff')}</p><h1>${citizensWin(g) ? t('game.result.crewWin') : t('game.result.impostorsWin')}</h1><p class="helper">${t('game.result.secretWas')}</p><h2 class="answer">${escape(gameWord)}</h2><p class="attempt-status">${t('game.attemptsUsed', { used: g.attemptsUsed, max: g.maxAttempts })}</p><div class="reveal-list">${g.players.filter(p => g.impostorIds.includes(p.id)).map(p => `<div>${avatar(p)}<strong>${escape(p.name)}</strong><span>${t('game.impostor')}</span></div>`).join('')}</div><p class="helper">${t('game.accused')} ${g.players.filter(p => g.accusedIds.includes(p.id)).map(p => escape(p.name)).join(', ')}</p>${button('again', `${t('game.rematch')} <span>↻</span>`)}${button('home', t('game.changeSetup'), 'text-btn')}</section>`;
}

function playerDialogView(): string {
  const editing = editingPlayerId ? data.players.find(p => p.id === editingPlayerId) : null;
  const title = editing ? t('player.editTitle') : t('player.newTitle');
  const helper = editing ? t('player.editHelper') : t('player.newHelper');
  const submit = editing ? t('player.saveChanges') : t('player.add');
  const stats = draftStats;
  return `<h2 id="dialog-title">${title}</h2><p class="helper">${helper}</p><form id="player-form"><label for="name">${t('player.nameLabel')}</label><input id="name" name="name" placeholder="${t('player.namePlaceholder')}" value="${escape(draftName)}" maxlength="24" required autocomplete="off"/><span class="field-label">${t('player.avatarLabel')}</span><div class="avatar-upload">${avatarMarkup(chosenAvatar, 'avatar-preview')}<div><label class="upload-label" for="avatar-upload">${t('player.upload')}</label><input id="avatar-upload" type="file" accept="image/*" capture="user"/></div></div><p class="upload-hint">${t('player.photoHint')}</p><button type="button" class="avatar-random" data-action="random-avatar">${t('player.randomAvatar')}</button><div class="avatar-picker">${avatars.map(([id, label], index) => `<button type="button" data-avatar="${id}" aria-label="${t('player.avatar', { index: index + 1, name: label })}" aria-pressed="${id === chosenAvatar}" class="${id === chosenAvatar ? 'chosen' : ''}">${avatarMarkup(id)}</button>`).join('')}</div><fieldset class="stats-editor"><legend>${t('stats.editorTitle')}</legend><p class="stats-helper">${t('stats.editorHelper')}</p><label for="stats-gamesPlayed">${t('stats.gamesPlayed')}</label><input id="stats-gamesPlayed" data-stat="gamesPlayed" type="number" min="0" step="1" value="${stats.gamesPlayed}" required/><label for="stats-citizenWins">${t('stats.citizenWins')}</label><input id="stats-citizenWins" data-stat="citizenWins" type="number" min="0" step="1" value="${stats.citizenWins}" required/><label for="stats-citizenLosses">${t('stats.citizenLosses')}</label><input id="stats-citizenLosses" data-stat="citizenLosses" type="number" min="0" step="1" value="${stats.citizenLosses}" required/><label for="stats-impostorWins">${t('stats.impostorWins')}</label><input id="stats-impostorWins" data-stat="impostorWins" type="number" min="0" step="1" value="${stats.impostorWins}" required/><label for="stats-impostorLosses">${t('stats.impostorLosses')}</label><input id="stats-impostorLosses" data-stat="impostorLosses" type="number" min="0" step="1" value="${stats.impostorLosses}" required/></fieldset><p id="form-error" class="error" role="alert"></p><p class="error upload-error" role="alert">${escape(photoError)}</p><button class="primary" type="submit">${submit} <span>${editing ? '✓' : '＋'}</span></button></form>`;
}

function readDraftStats(): PlayerStats | null {
  const keys: (keyof PlayerStats)[] = ['gamesPlayed', 'citizenWins', 'citizenLosses', 'impostorWins', 'impostorLosses'];
  const values = {} as PlayerStats;
  for (const key of keys) {
    const input = root.querySelector<HTMLInputElement>(`[data-stat="${key}"]`);
    const value = Number(input?.value);
    if (!input || !Number.isSafeInteger(value) || value < 0) return null;
    values[key] = value;
  }
  const outcomes = values.citizenWins + values.citizenLosses + values.impostorWins + values.impostorLosses;
  return values.gamesPlayed >= outcomes ? values : null;
}

function deleteDialogView(): string {
  const player = deletingPlayerId ? data.players.find(p => p.id === deletingPlayerId) : null;
  if (!player) return '';
  return `<h2 id="dialog-title">${t('player.deleteTitle')}</h2><p class="helper">${t('player.deleteHelper', { name: escape(player.name) })}</p>${button('confirm-delete', t('player.confirmDelete'))}${button('close', t('action.cancel'), 'text-btn')}`;
}

function dialogView(): string {
  if (!dialog) return '';
  let content = '';
  if (dialog === 'player') content = playerDialogView();
  if (dialog === 'rules') content = `<h2 id="dialog-title">${t('rules.title')}</h2><ol class="rules"><li><b>${t('rules.prepareTitle')}</b><p>${t('rules.prepareText')}</p></li><li><b>${t('rules.passTitle')}</b><p>${t('rules.passText')}</p></li><li><b>${t('rules.talkTitle')}</b><p>${t('rules.talkText')}</p></li><li><b>${t('rules.catchTitle')}</b><p>${t('rules.catchText')}</p></li></ol><p class="privacy">${t('rules.privacy')}</p>`;
  if (dialog === 'exit') content = `<h2 id="dialog-title">${t('exit.title')}</h2><p class="helper">${t('exit.helper')}</p>${button('home', t('exit.confirm'))}`;
  if (dialog === 'delete') content = deleteDialogView();
  return `<dialog aria-labelledby="dialog-title"><div class="dialog-inner">${button('close', '<span aria-hidden="true">×</span>', 'close icon-btn', false, t('action.close'))}${content}</div></dialog>`;
}

function render(): void {
  document.documentElement.lang = data.language;
  document.body.classList.add('is-playing');
  document.title = t('document.title');
  root.innerHTML = `<main class="shell gameplay"><header><a class="brand" href="./" aria-label="Impostor"><span class="brand-mark">◈</span> IMPOSTOR</a><div class="header-actions"><button data-action="language" class="language" aria-label="${t(data.language === 'it' ? 'language.switchToEnglish' : 'language.switchToItalian')}">${data.language.toUpperCase()} <span>⌄</span></button>${button('rules', '?', 'icon-btn')}</div></header>${error ? `<div class="error-banner" role="alert">${escape(error)}${!storageReady ? button('retry', t('action.retry'), 'text-btn') : ''}</div>` : ''}${data.activeGame ? gameView(data.activeGame) : categoryScreen ? categoryScreenView() : setup()}<footer><span>◈</span> ${t('footer.onePhone')}<span>·</span>${t('footer.onDevice')}</footer></main>${dialogView()}`;
  root.querySelector('[data-action="rules"]')?.setAttribute('aria-label', t('rules.open'));
  const modal = root.querySelector('dialog');
  if (modal) {
    modal.showModal();
    modal.addEventListener('cancel', () => { dialog = null; editingPlayerId = null; deletingPlayerId = null; photoError = ''; });
    modal.addEventListener('click', e => { if (e.target === modal) { dialog = null; editingPlayerId = null; deletingPlayerId = null; photoError = ''; render(); } });
    root.querySelector<HTMLInputElement>('#name')?.focus();
  }
}

function readAvatarPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) { reject(new Error('Unsupported image')); return; }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const max = 256;
      const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/webp', .82));
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Invalid image')); };
    image.src = url;
  });
}

root.addEventListener('input', e => {
  const target = e.target as HTMLInputElement;
  if (target.id === 'name') draftName = target.value;
  const stat = target.dataset.stat as keyof PlayerStats | undefined;
  if (stat && stat in draftStats) draftStats[stat] = Number(target.value) || 0;
});
root.addEventListener('change', e => {
  const target = e.target as HTMLInputElement | HTMLSelectElement;
  if (target.id === 'avatar-upload') {
    const file = (target as HTMLInputElement).files?.[0];
    if (!file) return;
    void readAvatarPhoto(file).then(photo => { chosenAvatar = photo; photoError = ''; render(); }).catch(() => { photoError = t('error.invalidImage'); render(); });
  }
});
root.addEventListener('submit', async e => {
  e.preventDefault();
  const name = draftName.trim().replace(/\s+/g, ' ');
  if (!name || name.length > 24 || data.players.some(p => p.id !== editingPlayerId && p.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    root.querySelector('#form-error')!.textContent = t('error.uniqueName');
    return;
  }
  const stats = readDraftStats();
  if (!stats) {
    root.querySelector('#form-error')!.textContent = t('error.invalidStats');
    return;
  }
  const playerId = editingPlayerId;
  await change(d => {
    if (playerId) {
      const player = d.players.find(p => p.id === playerId);
      if (player) { player.name = name; player.avatar = chosenAvatar; player.stats = stats; }
    } else {
      const player = { id: crypto.randomUUID(), name, avatar: chosenAvatar, createdAt: Date.now(), stats };
      d.players.push(player);
      if (d.selectedIds.length < 20) d.selectedIds.push(player.id);
    }
  });
  if (!error) { dialog = null; editingPlayerId = null; photoError = ''; render(); }
});
root.addEventListener('click', async e => {
  const target = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!target || target.disabled || busy) return;
  const { action, player, avatar: pick, accuse, category } = target.dataset;
  if (pick && avatars.some(([id]) => id === pick)) { chosenAvatar = pick as AvatarId; photoError = ''; render(); return; }
  if (action === 'random-avatar') { chosenAvatar = avatars[Math.floor(Math.random() * avatars.length)][0]; photoError = ''; render(); return; }
  if (action === 'open-categories') { categoryScreen = true; window.scrollTo(0, 0); render(); return; }
  if (action === 'close-categories') { categoryScreen = false; window.scrollTo(0, 0); render(); return; }
  if (category && (category === 'all' || categories.includes(category as SelectableCategoryId))) {
    await change(d => {
      if (category === 'all') {
        d.settings.category = 'all';
        return;
      }
      const current = selectedCategoryIds(normalizeCategorySelection(d.settings.category)) ?? [];
      const next = current.includes(category as SelectableCategoryId)
        ? current.filter(item => item !== category)
        : [...current, category as SelectableCategoryId];
      d.settings.category = next.length === 0 ? 'all' : next.length === 1 ? next[0] : next;
    });
    return;
  }
  if (action === 'edit-player' && player) {
    const current = data.players.find(p => p.id === player);
    if (!current) return;
    editingPlayerId = player;
    deletingPlayerId = null;
    draftName = current.name;
    draftStats = structuredClone(current.stats ?? emptyPlayerStats());
    chosenAvatar = isPhotoAvatar(current.avatar) ? current.avatar : resolveAvatar(current.avatar);
    photoError = '';
    dialog = 'player';
    render();
    return;
  }
  if (action === 'delete-player' && player) {
    if (!data.players.some(p => p.id === player)) return;
    deletingPlayerId = player;
    editingPlayerId = null;
    dialog = 'delete';
    photoError = '';
    render();
    return;
  }
  if (player) { await change(d => {
    if (d.selectedIds.includes(player)) d.selectedIds = d.selectedIds.filter(id => id !== player);
    else if (d.selectedIds.length < 20) d.selectedIds.push(player);
    d.settings.impostors = Math.min(d.settings.impostors, maxImpostors(d.selectedIds.length));
    d.settings.maxAttempts = Math.min(d.settings.maxAttempts, maxAttempts(d.selectedIds.length, d.settings.impostors));
  }); return; }
  if (accuse) { await change(d => { const g = d.activeGame!; if (g.accusedIds.includes(accuse)) g.accusedIds = g.accusedIds.filter(id => id !== accuse); else if (g.accusedIds.length < g.impostorIds.length) g.accusedIds.push(accuse); }); return; }
  switch (action) {
    case 'retry': await init(); break;
    case 'language': revealed = false; await change(d => { d.language = d.language === 'it' ? 'en' : 'it'; }); break;
    case 'rules': revealed = false; dialog = 'rules'; render(); break;
    case 'add': draftName = ''; draftStats = emptyPlayerStats(); editingPlayerId = null; deletingPlayerId = null; photoError = ''; chosenAvatar = avatars[Math.floor(Math.random() * avatars.length)][0]; dialog = 'player'; render(); break;
    case 'close': dialog = null; editingPlayerId = null; deletingPlayerId = null; photoError = ''; render(); break;
    case 'confirm-delete': {
      const playerId = deletingPlayerId;
      if (!playerId) break;
      await change(d => {
        d.players = d.players.filter(p => p.id !== playerId);
        d.selectedIds = d.selectedIds.filter(id => id !== playerId);
        d.settings.impostors = Math.min(d.settings.impostors, maxImpostors(d.selectedIds.length));
        d.settings.maxAttempts = Math.min(d.settings.maxAttempts, maxAttempts(d.selectedIds.length, d.settings.impostors));
      });
      if (!error) { dialog = null; deletingPlayerId = null; photoError = ''; render(); }
      break;
    }
    case 'minus': await change(d => { d.settings.impostors = Math.max(1, d.settings.impostors - 1); d.settings.maxAttempts = Math.min(d.settings.maxAttempts, maxAttempts(d.selectedIds.length, d.settings.impostors)); }); break;
    case 'plus': await change(d => { d.settings.impostors = Math.min(maxImpostors(d.selectedIds.length), d.settings.impostors + 1); d.settings.maxAttempts = Math.min(d.settings.maxAttempts, maxAttempts(d.selectedIds.length, d.settings.impostors)); }); break;
    case 'attempt-minus': await change(d => { d.settings.maxAttempts = Math.max(1, d.settings.maxAttempts - 1); }); break;
    case 'attempt-plus': await change(d => { d.settings.maxAttempts = Math.min(maxAttempts(d.selectedIds.length, d.settings.impostors), d.settings.maxAttempts + 1); }); break;
    case 'start': case 'again': categoryScreen = false; revealed = false; await change(d => { d.activeGame = createGame(selected(), d.settings, d.activeGame?.entry.word); }); window.scrollTo(0, 0); break;
    case 'reveal': revealCard(); break;
    case 'next': revealed = false; await change(d => { const g = d.activeGame!; if (g.revealIndex + 1 < g.players.length) g.revealIndex++; else g.phase = 'discuss'; }); window.scrollTo(0, 0); break;
    case 'vote': case 'discuss': await change(d => { d.activeGame!.phase = action; }); window.scrollTo(0, 0); break;
    case 'result': await change(d => { const g = d.activeGame!; if (g.accusedIds.length === g.impostorIds.length) { g.attemptsUsed += 1; if (citizensWin(g) || g.attemptsUsed >= g.maxAttempts) { g.phase = 'result'; if (!g.scoreRecorded) { d.players = recordGameResult(d.players, g); g.scoreRecorded = true; } } else { g.accusedIds = []; g.phase = 'discuss'; } } }); navigator.vibrate?.([30, 40, 30]); window.scrollTo(0, 0); break;
    case 'exit': revealed = false; dialog = 'exit'; editingPlayerId = null; deletingPlayerId = null; photoError = ''; render(); break;
    case 'home': categoryScreen = false; dialog = null; revealed = false; await change(d => { d.activeGame = null; }); window.scrollTo(0, 0); break;
  }
});
// Never persist an exposed card: reloads, app switching and history restore conceal it.
function hideSecret() { if (revealed) { revealed = false; render(); } }
document.addEventListener('visibilitychange', () => { if (document.hidden) hideSecret(); });
window.addEventListener('pagehide', hideSecret);
window.addEventListener('blur', hideSecret);

async function init() {
  try {
    const saved = await loadData<Game>();
    if (saved) data = saved;
    if (data.activeGame) {
      const migrated = structuredClone(data);
      const active = migrated.activeGame!;
      let needsSave = false;
      if (!Number.isInteger(active.maxAttempts)) { active.maxAttempts = maxAttempts(active.players.length, active.impostorIds.length); needsSave = true; }
      if (!Number.isInteger(active.attemptsUsed)) { active.attemptsUsed = 0; needsSave = true; }
      if (active.phase === 'result' && !active.scoreRecorded) { migrated.players = recordGameResult(migrated.players, active); active.scoreRecorded = true; needsSave = true; }
      if (needsSave) { await saveData(migrated); data = migrated; }
    }
    storageReady = true;
    error = '';
    if (!saved) await saveData(data);
  } catch {
    storageReady = false;
    error = t('error.storage');
  }
  render();
}
void init();

// Agent inspection exposes only public setup, never roles, words or hints.
const modelContext = (document as Document & { modelContext?: { registerTool: (tool: object, options: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
if (modelContext) {
  const lifecycle = new AbortController();
  try {
    void Promise.resolve(modelContext.registerTool({
      name: 'get_game_setup',
      description: 'Read the public Impostor setup and current phase. Never reveals secret roles, words or hints.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input: unknown) {
        if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Expected an empty object');
        const selected = selectedCategoryIds(normalizeCategorySelection(data.settings.category)) ?? categories;
        return { language: data.language, selectedPlayers: data.selectedIds.length, impostors: data.settings.impostors, categorySelection: data.settings.category, categoryLabels: selected.map(category => categoryLabel(data.language, category)), phase: data.activeGame?.phase ?? 'setup', storageReady };
      },
    }, { signal: lifecycle.signal })).catch(() => console.warn('Game setup tool registration unavailable'));
  } catch { console.warn('Game setup tool registration unavailable'); }
  if (import.meta.hot) import.meta.hot.dispose(() => lifecycle.abort());
}

function revealCard() {
  if (data.activeGame?.phase !== 'reveal' || revealed) return;
  revealed = true;
  navigator.vibrate?.(18);
  render();
}
let swipeStart: { y: number; id: number } | null = null;
root.addEventListener('pointerdown', event => {
  const card = (event.target as HTMLElement).closest<HTMLElement>('#secret-card');
  if (!card || revealed || data.activeGame?.phase !== 'reveal') return;
  swipeStart = { y: event.clientY, id: event.pointerId };
  card.setPointerCapture(event.pointerId);
});
root.addEventListener('pointerup', event => {
  if (swipeStart?.id === event.pointerId && swipeStart.y - event.clientY > 55) revealCard();
  swipeStart = null;
});
root.addEventListener('pointercancel', () => { swipeStart = null; });
