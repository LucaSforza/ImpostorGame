import './style.css';
import { emptyPlayerStats, loadData, saveData, type AppData, type ImpostorStats, type Player, type PlayerStats } from './db';
import { createGame, localizeEntry, maxAttempts, minAttempts, maxImpostors, citizensWin, resolveVote, type ActiveGame, type ImpostorGame } from './game';
import { assignBombLoser, bombExpired, createBombGame, rematchBomb, resolveBomb, type BombGame } from './bomb';
import { createSameWaveGame, rematchSameWave, submitSameWavePick, type SameWaveGame } from './same-wave';
import { buzzWhoAmI, createWhoAmIGame, nextWhoAmITurn, rematchWhoAmI, resolveWhoAmIGuess, visibleWhoAmIIdentities, type WhoAmIGame } from './who-am-i';
import { WHO_AM_I_IDENTITIES } from './who-am-i-content';
import { BOMB_CATEGORIES, BOMB_PROMPTS, type BombCategoryId } from './bomb-content';
import { SAME_WAVE_PROMPTS } from './same-wave-content';
import { playBombExplosion, primeBombAudio } from './bomb-audio';
import { gameCatalog, type GameId } from './catalog';
import { playerGameStats, recordActiveGameResult, totalStats } from './stats';
import { categoryDescription, categoryLabel, translate, type MessageKey, type MessageParams } from './i18n';
import { categories, normalizeCategorySelection, selectedCategoryIds, type CategoryId, type SelectableCategoryId } from './words';
import { screenFromHash, type AppScreen } from './router';
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
import impostorGameImage from './assets/games/impostore.webp';
import bombGameImage from './assets/games/bomba.webp';
import sameWaveGameImage from './assets/games/stessa-onda.webp';
import whoAmIGameImage from './assets/games/who-am-i.webp';

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
let data: AppData<ActiveGame> = {
  players: [], selectedIds: [], selectedGameId: 'impostor',
  settings: { impostor: { impostors: 1, maxAttempts: 1, category: 'all' }, bomb: { category: 'all' }, sameWave: { category: 'all' }, whoAmI: { category: 'all' } },
  activeGame: null, language: 'it',
};
let revealed = false;
let whoAmIRevealed = false;
let busy = false;
let storageReady = false;
let error = '';
let categoryScreen = false;
let screen: AppScreen = screenFromHash(location.hash);
let bombTimer: number | null = null;
let bombExpiryInFlight = false;
let bombExpiryAttemptedGameId: string | null = null;
let bombExplosionFeedback = false;
let bombExplosionFeedbackTimer: number | null = null;
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
const clampAttempts = (playerCount: number, impostorCount: number, value: number) => Math.max(minAttempts(playerCount, impostorCount), Math.min(maxAttempts(playerCount, impostorCount), value));
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
  const stats = totalStats(player.stats ?? emptyPlayerStats());
  const formattedRate = new Intl.NumberFormat(data.language, { maximumFractionDigits: 1 }).format(stats.winRate * 100);
  return t('stats.summary', { played: stats.gamesPlayed, rate: formattedRate });
}

function playerCard(p: Player): string {
  const included = data.selectedIds.includes(p.id);
  const disabled = busy || !storageReady;
  return `<div class="player-row"><button class="player ${included ? 'selected' : ''}" data-player="${p.id}" aria-pressed="${included}" ${disabled ? 'disabled' : ''}>${avatar(p)}<span class="player-copy"><span class="player-name">${escape(p.name)}</span><span class="player-stats">${playerStatsSummary(p)}</span></span><span class="check" aria-hidden="true">${included ? '✓' : '+'}</span></button><div class="player-actions"><button type="button" class="player-action" data-action="edit-player" data-player="${p.id}" aria-label="${t('action.edit')} ${escape(p.name)}" ${disabled ? 'disabled' : ''}>${t('action.edit')}</button><button type="button" class="player-action danger" data-action="delete-player" data-player="${p.id}" aria-label="${t('action.delete')} ${escape(p.name)}" ${disabled ? 'disabled' : ''}>${t('action.delete')}</button></div></div>`;
}

async function change(update: (next: AppData<ActiveGame>) => void): Promise<boolean> {
  if (busy || !storageReady) return false;
  busy = true;
  root.querySelectorAll<HTMLButtonElement | HTMLSelectElement>('button, select').forEach(control => { control.disabled = true; });
  const next = structuredClone(data);
  let saved = false;
  try {
    update(next);
    await saveData(next);
    data = next;
    error = '';
    saved = true;
  } catch {
    error = t('error.save');
  } finally { busy = false; render(); }
  return saved;
}

function categoryCard(category: 'all' | SelectableCategoryId): string {
  const selection = normalizeCategorySelection(data.settings.impostor.category);
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
  const selection = normalizeCategorySelection(data.settings.impostor.category);
  const selectedCount = selection === 'all' ? categories.length : (selectedCategoryIds(selection) ?? []).length;
  const summaryKey = selection === 'all' ? 'category.selectedAll' : selectedCount === 1 ? 'category.selectedOne' : 'category.selectedMany';
  return `<p class="category-hint">${t('category.selectHint')}</p><div class="category-picker" role="group" aria-label="${t('deck.title')}">${categoryCard('all')}${categories.map(categoryCard).join('')}</div><p class="category-summary">${t(summaryKey, { count: selectedCount })}</p>`;
}

function categorySelectionSummary(): string {
  const selection = normalizeCategorySelection(data.settings.impostor.category);
  const count = selection === 'all' ? categories.length : (selectedCategoryIds(selection) ?? []).length;
  const key = selection === 'all' ? 'category.selectedAll' : count === 1 ? 'category.selectedOne' : 'category.selectedMany';
  return t(key, { count });
}

function categoryScreenView(): string {
  return `<section class="category-screen"><div class="category-screen-head"><button class="category-screen-back" data-action="close-categories" aria-label="${t('category.back')}">←</button><div><span class="eyebrow">${t('category.eyebrow')}</span><h1>${t('category.title')}</h1></div></div>${categoryPicker()}${button('close-categories', `${t('category.done')} <span>✓</span>`)}</section>`;
}

function impostorSetup(): string {
  const count = data.selectedIds.length;
  const attemptLimit = maxAttempts(count, data.settings.impostor.impostors);
  const attemptMinimum = minAttempts(count, data.settings.impostor.impostors);
  const attempts = clampAttempts(count, data.settings.impostor.impostors, data.settings.impostor.maxAttempts);
  return `<section class="cover"><div class="cover-art"></div><div class="cover-copy"><span class="eyebrow">${t('cover.eyebrow')}</span><h1>${t('cover.title')}</h1><p>${t('cover.subtitle')}</p></div><span class="cover-tag">${t('cover.tag')}</span><span class="spark">✦</span></section>
  <section class="setup"><div class="section-heading"><div><span class="eyebrow">${t('setup.eyebrow')}</span><h2>${t('setup.title')}</h2></div><span class="count">${count}/20</span></div>
  ${data.players.length ? `<p class="helper">${t('setup.helper')}</p><div class="players">${data.players.map(playerCard).join('')}</div>` : `<div class="empty"><span>✦</span><p>${t('setup.empty')}</p></div>`}
  ${button('add', `＋ ${t('player.new')}`, 'secondary', !storageReady)}
  <div class="setting"><div><strong>${t('game.impostors')}</strong><small>${t('game.impostorHint')}</small></div><div class="stepper"><button data-action="minus" aria-label="${t('game.fewerImpostors')}" ${data.settings.impostor.impostors <= 1 || busy ? 'disabled' : ''}>−</button><b>${data.settings.impostor.impostors}</b><button data-action="plus" aria-label="${t('game.moreImpostors')}" ${data.settings.impostor.impostors >= maxImpostors(count) || busy ? 'disabled' : ''}>+</button></div></div>
  <div class="setting"><div><strong>${t('game.attempts')}</strong><small>${t('game.attemptsHint', { min: attemptMinimum, max: attemptLimit })}</small></div><div class="stepper"><button data-action="attempt-minus" aria-label="${t('game.fewerAttempts')}" ${attempts <= attemptMinimum || busy ? 'disabled' : ''}>−</button><b>${attempts}</b><button data-action="attempt-plus" aria-label="${t('game.moreAttempts')}" ${attempts >= attemptLimit || busy ? 'disabled' : ''}>+</button></div></div>
  <div class="setting category-setting"><div class="category-setting-copy"><strong>${t('deck.title')}</strong><small>${t('deck.subtitle')}</small><span>${categorySelectionSummary()}</span></div>${button('open-categories', `${t('category.change')} <span>→</span>`, 'category-open')}</div>
  ${button('start', `${t('game.start')} <span>↗</span>`, 'primary', count < 3 || !storageReady)}
  <p class="footnote">${count < 3 ? t(3 - count === 1 ? 'setup.morePlayersOne' : 'setup.morePlayersMany', { count: 3 - count }) : t('setup.passSecrets')}</p></section>`;
}

const gameImages: Record<GameId, string> = { impostor: impostorGameImage, bomb: bombGameImage, 'same-wave': sameWaveGameImage, 'who-am-i': whoAmIGameImage };
const gameName = (id: GameId) => t(`catalog.${id === 'same-wave' ? 'sameWave' : id === 'who-am-i' ? 'whoAmI' : id}.name` as MessageKey);

function catalogView(): string {
  const cards = gameCatalog.list().map(game => `<article class="catalog-card"><img class="catalog-card-image" src="${gameImages[game.id]}" alt=""/><div class="catalog-card-copy"><div class="catalog-card-head"><h2>${gameName(game.id)}</h2><span class="catalog-players">${t('catalog.players', { min: game.minPlayers, max: game.maxPlayers })}</span></div><p>${t(game.descriptionKey as MessageKey)}</p><div class="catalog-meta"><span class="catalog-players">${t('setup.sharedProfiles')}</span><button class="catalog-play" data-game="${game.id}">${t('catalog.play')} →</button></div></div></article>`).join('');
  return `<section class="catalog-hero"><span class="eyebrow">${t('catalog.eyebrow')}</span><h1>${t('catalog.title')}</h1><p>${t('catalog.subtitle')}</p><div class="privacy-pill"><span>◇</span>${t('catalog.privacy')}</div></section><section class="game-catalog">${cards}</section>`;
}

function setupRoster(minPlayers: number): string {
  const count = data.selectedIds.length;
  return `<section class="setup"><div class="section-heading"><div><span class="eyebrow">${t('setup.eyebrow')}</span><h2>${t('setup.title')}</h2></div><span class="count">${count}/20</span></div><p class="shared-note">◇ ${t('setup.sharedProfiles')}</p>${data.players.length ? `<p class="helper">${t('setup.helper')}</p><div class="players">${data.players.map(playerCard).join('')}</div>` : `<div class="empty"><span>✦</span><p>${t('setup.empty')}</p></div>`}${button('add', `＋ ${t('player.new')}`, 'secondary', !storageReady)}${count < minPlayers ? `<p class="footnote">${t('setup.needPlayers', { count: minPlayers })}</p>` : ''}</section>`;
}

function gameSetupHeader(id: GameId): string {
  const definition = gameCatalog.get(id);
  return `<div class="game-setup-head"><button class="icon-btn" data-action="catalog" aria-label="${t('catalog.back')}">←</button><div><span class="eyebrow">${t('catalog.players', { min: definition.minPlayers, max: definition.maxPlayers })}</span><h1>${gameName(id)}</h1></div></div><section class="game-cover"><img src="${gameImages[id]}" alt=""/><div class="game-cover-copy"><h2>${gameName(id)}</h2><p>${t(definition.descriptionKey as MessageKey)}</p></div></section>`;
}

function bombSetup(): string {
  const current = data.settings.bomb.category;
  const categoriesMarkup = [`<button class="bomb-category ${current === 'all' ? 'selected' : ''}" data-bomb-category="all">${t('bomb.categoryAll')}</button>`, ...BOMB_CATEGORIES.map(category => `<button class="bomb-category ${current === category.id ? 'selected' : ''}" data-bomb-category="${category.id}">${escape(category.label[data.language])}</button>`)].join('');
  return `${gameSetupHeader('bomb')}${setupRoster(2)}<section class="setup"><div class="setting"><div><strong>${t('bomb.category')}</strong><small>${t('catalog.bomb.description')}</small></div></div><div class="bomb-category-grid">${categoriesMarkup}</div>${button('start', `${t('game.start')} <span>↗</span>`, 'primary', data.selectedIds.length < 2 || !storageReady)}</section>`;
}

function sameWaveSetup(): string {
  return `${gameSetupHeader('same-wave')}${setupRoster(3)}<section class="setup">${button('start', `${t('game.start')} <span>↗</span>`, 'primary', data.selectedIds.length < 3 || !storageReady)}</section>`;
}

function whoAmISetup(): string {
  return `${gameSetupHeader('who-am-i')}${setupRoster(3)}<section class="setup"><p class="helper">${t('whoAmI.setup.helper')}</p>${button('start', `${t('game.start')} <span>↗</span>`, 'primary', data.selectedIds.length < 3 || !storageReady)}</section>`;
}

function setup(): string {
  if (data.selectedGameId === 'bomb') return bombSetup();
  if (data.selectedGameId === 'same-wave') return sameWaveSetup();
  if (data.selectedGameId === 'who-am-i') return whoAmISetup();
  return `${gameSetupHeader('impostor')}${impostorSetup()}`;
}

function statsView(): string {
  const aggregate = data.players.reduce((sum, player) => { const value = totalStats(player.stats); return { gamesPlayed: sum.gamesPlayed + value.gamesPlayed, wins: sum.wins + value.wins, losses: sum.losses + value.losses }; }, { gamesPlayed: 0, wins: 0, losses: 0 });
  const aggregateRate = aggregate.gamesPlayed ? aggregate.wins / aggregate.gamesPlayed : 0;
  const playerCards = data.players.map(player => {
    const overall = totalStats(player.stats);
    const games = gameCatalog.list().map(game => { const value = playerGameStats(player, game.id); return `<div class="stats-game-row"><strong>${gameName(game.id)}</strong><span>${t('stats.gameLine', { played: value.gamesPlayed, wins: value.wins, losses: value.losses })}</span></div>`; }).join('');
    return `<article class="stats-player-card"><div class="stats-player-head">${avatar(player)}<div><h2>${escape(player.name)}</h2><small>${t('stats.summary', { played: overall.gamesPlayed, rate: new Intl.NumberFormat(data.language, { maximumFractionDigits: 1 }).format(overall.winRate * 100) })}</small></div></div><div class="stats-game-list">${games}<div class="stats-game-row"><strong>${t('catalog.impostor.name')} · ${t('stats.roleSplit', { crew: player.stats.impostor.citizenWins, impostor: player.stats.impostor.impostorWins })}</strong></div></div></article>`;
  }).join('');
  return `<section class="stats-screen"><button class="text-btn" data-action="catalog">← ${t('stats.back')}</button><span class="eyebrow">${t('stats.eyebrow')}</span><h1>${t('stats.title')}</h1><p class="helper">${t('stats.subtitle')}</p><div class="stats-summary-grid"><div class="stat-tile"><strong>${aggregate.gamesPlayed}</strong><small>${t('stats.gamesPlayed')}</small></div><div class="stat-tile"><strong>${aggregate.wins}</strong><small>${t('stats.wins')}</small></div><div class="stat-tile"><strong>${aggregate.losses}</strong><small>${t('stats.losses')}</small></div><div class="stat-tile"><strong>${new Intl.NumberFormat(data.language, { maximumFractionDigits: 1 }).format(aggregateRate * 100)}%</strong><small>${t('stats.winRate')}</small></div></div>${data.players.length ? `<div class="stats-player-list">${playerCards}</div>` : `<div class="stats-empty">${t('stats.noPlayers')}</div>`}</section>`;
}

function impostorGameView(g: ImpostorGame): string {
  const p = g.players[g.revealIndex];
  const { word: gameWord, hint } = localizeEntry(g.entry, data.language);
  const phaseLabel = { reveal: t('game.phase.reveal'), discuss: t('game.phase.discuss'), vote: t('game.phase.vote'), result: t('game.phase.result') }[g.phase];
  const allAccusedIds = new Set([...g.eliminatedIds, ...g.accusedIds]);
  const top = `<div class="round-top">${button('exit', '←', 'icon-btn')}<span class="eyebrow">${phaseLabel}</span><span class="count">${g.players.length} ${t('game.friends')}</span></div>`;
  if (g.phase === 'reveal') {
    const impostor = g.impostorIds.includes(p.id);
    return `<div class="game-logo"><span>${t('game.logo.find')}</span><strong>${t('game.logo.impostor')}</strong></div>${top}<div class="progress" aria-label="${g.revealIndex + 1}/${g.players.length}">${g.players.map((_, i) => `<i class="${i <= g.revealIndex ? 'done' : ''}"></i>`).join('')}</div><section class="game-screen"><p class="eyebrow">${t('game.passPhoneTo')}</p><h1 class="player-title">${escape(p.name)}</h1><p class="helper">${t('game.noPeeking')}</p><div id="secret-card" class="secret-card ${revealed ? 'flipped' : ''}">${revealed ? `<span class="role-label">${impostor ? t('game.impostorRole') : t('game.crewRole')}</span><span class="secret-icon">${impostor ? '🕵️' : '🤫'}</span><p>${impostor ? t('game.yourHint') : t('game.secretWord')}</p><h2 class="secret-word">${escape(impostor ? hint : gameWord)}</h2><p class="helper">${impostor ? t('game.impostorInstruction') : t('game.crewInstruction')}</p>` : `${avatarArt(p.avatar)}<div class="swipe-prompt"><span>↑</span><b>${t('game.swipeReveal')}</b><small>${t('game.revealButtonHint')}</small></div>`}</div>${revealed ? button('next', `${t('game.hideAndPass')} <span>→</span>`) : button('reveal', `${t('game.iAm')} ${escape(p.name)} · ${t('game.reveal')} <span>◈</span>`)}<p class="footnote">${g.revealIndex + 1} ${t('game.of')} ${g.players.length} · ${t('game.appHidesSecret')}</p></section>`;
  }
  if (g.phase === 'discuss') {
    const starter = g.players.find(x => x.id === g.starterId)!;
    const remainingAttempts = g.maxAttempts - g.attemptsUsed;
    const attemptNotice = g.attemptsUsed > 0 ? `<div class="attempt-notice">${t(g.lastVoteWasImpostor ? 'game.attemptFound' : remainingAttempts === 1 ? 'game.attemptFailedOne' : 'game.attemptFailedMany', { used: g.attemptsUsed, remaining: remainingAttempts })}</div>` : '';
    return `${top}<section class="game-screen">${attemptNotice}<span class="big-symbol">✦</span><h1>${t('game.discuss.title')}</h1><p class="helper">${t('game.discuss.subtitle')}</p><div class="starter">${avatar(starter)}<div><small>${t('game.breaksIce')}</small><strong>${escape(starter.name)}</strong></div></div><div class="tip"><b>${t('game.askQuestions')}</b><p>${t('game.discuss.tip')}</p></div>${button('vote', `${t('game.vote')} <span>→</span>`)}</section>`;
  }
  if (g.phase === 'vote') {
    const votePlayers = g.players.map(p => {
      const selected = g.accusedIds.includes(p.id);
      const eliminated = g.eliminatedIds.includes(p.id);
      return `<button class="player ${selected ? 'selected' : ''}${eliminated ? ' eliminated' : ''}" data-accuse="${p.id}" aria-pressed="${selected}" ${eliminated ? 'disabled' : ''}>${avatar(p)}<span>${escape(p.name)}</span><span class="check">${eliminated ? t('game.alreadyVoted') : selected ? '✓' : '+'}</span></button>`;
    }).join('');
    return `${top}<section class="game-screen"><p class="eyebrow">${t('game.vote.trust')}</p><h1>${t('game.vote.title')}</h1><p class="attempt-status">${t('game.attemptStatus', { used: g.attemptsUsed + 1, max: g.maxAttempts })}</p><p class="helper">${t('game.vote.helper')}</p><div class="players vote-players">${votePlayers}</div>${button('result', `${t('game.revealTruth')} <span>✦</span>`, 'primary', g.accusedIds.length !== 1)}${button('discuss', t('game.backToDiscussion'), 'text-btn')}</section>`;
  }
  return `${top}<section class="game-screen result"><div class="confetti" aria-hidden="true">✦ · ✧ · ✦</div><span class="big-symbol">${citizensWin(g) ? '🏆' : '🕵️'}</span><p class="eyebrow">${t('game.result.masksOff')}</p><h1>${citizensWin(g) ? t('game.result.crewWin') : t('game.result.impostorsWin')}</h1><p class="helper">${t('game.result.secretWas')}</p><h2 class="answer">${escape(gameWord)}</h2><p class="attempt-status">${t('game.attemptsUsed', { used: g.attemptsUsed, max: g.maxAttempts })}</p><div class="reveal-list">${g.players.filter(p => g.impostorIds.includes(p.id)).map(p => `<div>${avatar(p)}<strong>${escape(p.name)}</strong><span>${t('game.impostor')}</span></div>`).join('')}</div><p class="helper">${t('game.accused')} ${g.players.filter(p => allAccusedIds.has(p.id)).map(p => escape(p.name)).join(', ')}</p>${button('again', `${t('game.rematch')} <span>↻</span>`)}${button('home', t('game.changeSetup'), 'text-btn')}</section>`;
}

function bombGameView(g: BombGame): string {
  const topic = data.language === 'it' ? g.prompt.topic : g.prompt.topicEn;
  const top = `<div class="round-top">${button('exit', '←', 'icon-btn')}<span class="eyebrow">${gameName('bomb')}</span><span class="count">${g.players.length} ${t('game.friends')}</span></div>`;
  if (g.phase === 'result') {
    const loser = g.players.find(player => player.id === g.loserId);
    return `${top}<section class="game-screen result live-card"><span class="big-symbol">💥</span><p class="eyebrow">${t('bomb.result.eyebrow')}</p><h1>${t('bomb.result.title', { name: escape(loser?.name ?? '') })}</h1><p class="helper">${t('bomb.result.helper')}</p><span class="topic">${escape(topic)}</span>${button('again', `${t('game.rematch')} <span>↻</span>`)}${button('home', t('game.changeSetup'), 'text-btn')}</section>`;
  }
  if (g.phase === 'assigning') {
    if (bombExplosionFeedback) {
      return `${top}<section class="game-screen bomb-explosion-feedback live-card" aria-live="assertive"><span class="big-symbol bomb-explosion-symbol" aria-hidden="true">💥</span><p class="eyebrow">${t('bomb.explosion.eyebrow')}</p><h1>${t('bomb.explosion.title')}</h1><p class="helper" role="status">${t('bomb.explosion.message')}</p></section>`;
    }
    const players = g.players.map(player => `<button class="player" data-action="bomb-loser" data-bomb-loser="${escape(player.id)}"><span class="avatar-wrap">${avatar(player)}</span><span>${escape(player.name)}</span><span class="check">→</span></button>`).join('');
    return `${top}<section class="game-screen bomb-assign live-card"><span class="big-symbol">💥</span><p class="eyebrow">${t('bomb.assign.eyebrow')}</p><h1>${t('bomb.assign.title')}</h1><p class="helper">${t('bomb.assign.helper')}</p><div class="players vote-players">${players}</div></section>`;
  }
  const starter = g.players[0];
  return `${top}<section class="game-screen live-card"><p class="eyebrow">${t('bomb.topic')}</p><span class="topic">${escape(topic)}</span><div class="bomb-orb" aria-hidden="true">💣</div><div class="bomb-starter starter">${starter ? `${avatar(starter)}<strong>${t('bomb.starter', { name: escape(starter.name) })}</strong>` : ''}</div><p class="helper">${t('bomb.tick')}</p></section>`;
}

function sameWaveGameView(g: SameWaveGame): string {
  const prompt = data.language === 'it' ? g.prompt.prompt : g.prompt.promptEn;
  const options = data.language === 'it' ? g.prompt.options : g.prompt.optionsEn;
  const top = `<div class="round-top">${button('exit', '←', 'icon-btn')}<span class="eyebrow">${gameName('same-wave')}</span><span class="count">${g.players.length} ${t('game.friends')}</span></div>`;
  if (g.phase === 'result') {
    const groups = options.map((option, index) => { const members = g.players.filter(player => g.picks[player.id] === String(index)); if (!members.length) return ''; const winner = members.some(player => g.winnerIds.includes(player.id)); return `<div class="wave-group ${winner ? 'winner' : ''}"><strong>${escape(option)}</strong><div class="wave-players">${members.map(player => `<span class="wave-player">${escape(player.name)}</span>`).join('')}</div></div>`; }).join('');
    return `${top}<section class="game-screen result live-card"><span class="big-symbol">〰</span><p class="eyebrow">${t('sameWave.result.eyebrow')}</p><h1>${t('sameWave.result.title')}</h1><p class="helper">${g.winnerIds.length ? t('sameWave.result.winners', { count: g.winnerIds.length }) : t('sameWave.result.noMatch')}</p><h2 class="answer">${escape(prompt)}</h2><div class="wave-groups">${groups}</div>${button('again', `${t('game.rematch')} <span>↻</span>`)}${button('home', t('game.changeSetup'), 'text-btn')}</section>`;
  }
  const player = g.players[g.currentPlayerIndex];
  const optionsMarkup = options.map((option, index) => `<button class="wave-option" data-wave-choice="${index}">${escape(option)}</button>`).join('');
  return `${top}<section class="game-screen live-card"><p class="eyebrow">${t('sameWave.pass')}</p><h1>${escape(player.name)}</h1><p class="helper">${t('sameWave.noPeeking')}</p><div id="secret-card" class="secret-card ${revealed ? 'flipped' : ''}">${revealed ? `<p class="eyebrow">${t('sameWave.choose')}</p><h2>${escape(prompt)}</h2><div class="wave-options">${optionsMarkup}</div>` : `${avatarArt(player.avatar)}<div class="swipe-prompt"><span>↑</span><b>${t('sameWave.reveal')}</b><small>${t('game.revealButtonHint')}</small></div>`}</div>${revealed ? '' : button('reveal', `${t('game.iAm')} ${escape(player.name)} · ${t('sameWave.reveal')}`)}<p class="footnote">${g.currentPlayerIndex + 1} ${t('game.of')} ${g.players.length} · ${t('game.appHidesSecret')}</p></section>`;
}

function whoAmIGameView(g: WhoAmIGame): string {
  const top = `<div class="round-top">${button('exit', '←', 'icon-btn')}<span class="eyebrow">${gameName('who-am-i')}</span><span class="count">${g.players.length} ${t('game.friends')}</span></div>`;
  if (g.phase === 'result') {
    const winners = g.winnerIds.map((id) => escape(g.players.find((player) => player.id === id)?.name ?? '')).join(', ');
    return `${top}<section class="game-screen result live-card"><span class="big-symbol">${g.winnerIds.length ? '🏆' : '🎯'}</span><p class="eyebrow">${t('whoAmI.result.eyebrow')}</p><h1>${g.winnerIds.length ? t('whoAmI.result.win') : t('whoAmI.result.noWinner')}</h1><p class="helper">${g.winnerIds.length ? t('whoAmI.result.winnerNames', { names: winners }) : t('whoAmI.result.allWrong')}</p>${button('again', `${t('game.rematch')} <span>↻</span>`)}${button('home', t('game.changeSetup'), 'text-btn')}</section>`;
  }
  if (g.phase === 'reveal') {
    const viewer = g.players[g.turnIndex];
    const identities = visibleWhoAmIIdentities(g, viewer.id).map(({ player, identity }) => `<div class="player"><span>${escape(player.name)}</span><strong>${escape(data.language === 'it' ? identity.label : identity.labelEn)}</strong></div>`).join('');
    const secret = whoAmIRevealed ? `<div class="players">${identities}</div>${button('who-playing', t('whoAmI.reveal.done'))}` : `${avatarArt(viewer.avatar)}${button('who-reveal', t('whoAmI.reveal.show'))}`;
    return `${top}<section class="game-screen live-card"><p class="eyebrow">${t('whoAmI.reveal.eyebrow')}</p><h1>${t('whoAmI.reveal.title', { name: escape(viewer.name) })}</h1><p class="helper">${t('whoAmI.reveal.helper')}</p>${secret}</section>`;
  }
  const player = g.players[g.turnIndex];
  const buzzed = g.buzzedId === player.id;
  const identity = g.identityByPlayerId[player.id];
  const action = buzzed ? 'who-correct' : 'who-buzz';
  const label = buzzed ? t('whoAmI.buzz.adjudicate') : t('whoAmI.buzz.button');
  const revealedIdentity = data.language === 'it' ? identity.label : identity.labelEn;
  return `${top}<section class="game-screen live-card"><p class="eyebrow">${t('whoAmI.turn.eyebrow')}</p><h1>${t('whoAmI.turn.title', { name: escape(player.name) })}</h1><p class="helper">${buzzed ? t('whoAmI.buzz.helper') : t('whoAmI.turn.helper')}</p>${buzzed ? `<h2 class="answer">${t('whoAmI.buzz.identity', { identity: escape(revealedIdentity) })}</h2>` : ''}${button(action, label, 'primary', false)}${buzzed ? button('who-wrong', t('whoAmI.buzz.wrong'), 'secondary') : button('who-next', t('whoAmI.turn.next'), 'secondary')}<div class="players">${g.players.filter((candidate) => !g.eliminatedIds.includes(candidate.id)).map((candidate) => `<div class="player"><span>${escape(candidate.name)}</span>${candidate.id === player.id ? `<strong>${t('whoAmI.turn.current')}</strong>` : ''}</div>`).join('')}</div></section>`;
}

function activeGameView(game: ActiveGame): string {
  if (game.gameId === 'bomb') return bombGameView(game);
  if (game.gameId === 'same-wave') return sameWaveGameView(game);
  if (game.gameId === 'who-am-i') return whoAmIGameView(game);
  return impostorGameView(game);
}

function playerDialogView(): string {
  const editing = editingPlayerId ? data.players.find(p => p.id === editingPlayerId) : null;
  const title = editing ? t('player.editTitle') : t('player.newTitle');
  const helper = editing ? t('player.editHelper') : t('player.newHelper');
  const submit = editing ? t('player.saveChanges') : t('player.add');
  const stats = draftStats.impostor;
  return `<h2 id="dialog-title">${title}</h2><p class="helper">${helper}</p><form id="player-form"><label for="name">${t('player.nameLabel')}</label><input id="name" name="name" placeholder="${t('player.namePlaceholder')}" value="${escape(draftName)}" maxlength="24" required autocomplete="off"/><span class="field-label">${t('player.avatarLabel')}</span><div class="avatar-upload">${avatarMarkup(chosenAvatar, 'avatar-preview')}<div><label class="upload-label" for="avatar-upload">${t('player.upload')}</label><input id="avatar-upload" type="file" accept="image/*" capture="user"/></div></div><p class="upload-hint">${t('player.photoHint')}</p><button type="button" class="avatar-random" data-action="random-avatar">${t('player.randomAvatar')}</button><div class="avatar-picker">${avatars.map(([id, label], index) => `<button type="button" data-avatar="${id}" aria-label="${t('player.avatar', { index: index + 1, name: label })}" aria-pressed="${id === chosenAvatar}" class="${id === chosenAvatar ? 'chosen' : ''}">${avatarMarkup(id)}</button>`).join('')}</div><fieldset class="stats-editor"><legend>${t('stats.editorTitle')}</legend><p class="stats-helper">${t('stats.editorHelper')}</p><label for="stats-gamesPlayed">${t('stats.gamesPlayed')}</label><input id="stats-gamesPlayed" data-stat="gamesPlayed" type="number" min="0" step="1" value="${stats.gamesPlayed}" required/><label for="stats-citizenWins">${t('stats.citizenWins')}</label><input id="stats-citizenWins" data-stat="citizenWins" type="number" min="0" step="1" value="${stats.citizenWins}" required/><label for="stats-citizenLosses">${t('stats.citizenLosses')}</label><input id="stats-citizenLosses" data-stat="citizenLosses" type="number" min="0" step="1" value="${stats.citizenLosses}" required/><label for="stats-impostorWins">${t('stats.impostorWins')}</label><input id="stats-impostorWins" data-stat="impostorWins" type="number" min="0" step="1" value="${stats.impostorWins}" required/><label for="stats-impostorLosses">${t('stats.impostorLosses')}</label><input id="stats-impostorLosses" data-stat="impostorLosses" type="number" min="0" step="1" value="${stats.impostorLosses}" required/></fieldset><p id="form-error" class="error" role="alert"></p><p class="error upload-error" role="alert">${escape(photoError)}</p><button class="primary" type="submit">${submit} <span>${editing ? '✓' : '＋'}</span></button></form>`;
}

function readDraftStats(): PlayerStats | null {
  const keys: (keyof ImpostorStats)[] = ['gamesPlayed', 'citizenWins', 'citizenLosses', 'impostorWins', 'impostorLosses'];
  const values = structuredClone(draftStats);
  for (const key of keys) {
    const input = root.querySelector<HTMLInputElement>(`[data-stat="${key}"]`);
    const value = Number(input?.value);
    if (!input || !Number.isSafeInteger(value) || value < 0) return null;
    values.impostor[key] = value;
  }
  const role = values.impostor;
  const outcomes = role.citizenWins + role.citizenLosses + role.impostorWins + role.impostorLosses;
  if (role.gamesPlayed !== outcomes) return null;
  role.wins = role.citizenWins + role.impostorWins;
  role.losses = role.citizenLosses + role.impostorLosses;
  return values;
}

function deleteDialogView(): string {
  const player = deletingPlayerId ? data.players.find(p => p.id === deletingPlayerId) : null;
  if (!player) return '';
  return `<h2 id="dialog-title">${t('player.deleteTitle')}</h2><p class="helper">${t('player.deleteHelper', { name: escape(player.name) })}</p>${button('confirm-delete', t('player.confirmDelete'))}${button('close', t('action.cancel'), 'text-btn')}`;
}

type HelpContext = 'catalog' | 'stats' | 'impostor' | 'bomb' | 'sameWave' | 'whoAmI';
const helpCopy: Record<HelpContext, { title: MessageKey; body: MessageKey }> = {
  catalog: { title: 'help.catalog.title', body: 'help.catalog.body' },
  stats: { title: 'help.stats.title', body: 'help.stats.body' },
  impostor: { title: 'help.impostor.title', body: 'help.impostor.body' },
  bomb: { title: 'help.bomb.title', body: 'help.bomb.body' },
  sameWave: { title: 'help.sameWave.title', body: 'help.sameWave.body' },
  whoAmI: { title: 'help.whoAmI.title', body: 'help.whoAmI.body' },
};

function currentHelpContext(): HelpContext {
  if (data.activeGame) return data.activeGame.gameId === 'same-wave' ? 'sameWave' : data.activeGame.gameId === 'who-am-i' ? 'whoAmI' : data.activeGame.gameId;
  if (screen === 'stats') return 'stats';
  if (screen === 'setup') return data.selectedGameId === 'same-wave' ? 'sameWave' : data.selectedGameId === 'who-am-i' ? 'whoAmI' : data.selectedGameId;
  return 'catalog';
}

function helpDialogView(): string {
  const copy = helpCopy[currentHelpContext()];
  return `<h2 id="dialog-title">${t(copy.title)}</h2><p class="helper">${t(copy.body)}</p><button type="button" class="text-btn" data-action="close">${t('action.close')}</button>`;
}

function dialogView(): string {
  if (!dialog) return '';
  let content = '';
  if (dialog === 'player') content = playerDialogView();
  if (dialog === 'rules') content = helpDialogView();
  if (dialog === 'exit') content = `<h2 id="dialog-title">${t('exit.title')}</h2><p class="helper">${t('exit.helper')}</p>${button('home', t('exit.confirm'))}`;
  if (dialog === 'delete') content = deleteDialogView();
  return `<dialog aria-labelledby="dialog-title"><div class="dialog-inner">${button('close', '<span aria-hidden="true">×</span>', 'close icon-btn', false, t('action.close'))}${content}</div></dialog>`;
}

function resetScrollToTop(): void {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
}

function render(resetScroll = false): void {
  document.documentElement.lang = data.language;
  document.body.classList.toggle('is-playing', Boolean(data.activeGame));
  document.title = t('document.title');
  const content = data.activeGame ? activeGameView(data.activeGame) : categoryScreen ? categoryScreenView() : screen === 'stats' ? statsView() : screen === 'setup' ? setup() : catalogView();
  const nav = data.activeGame ? '' : `<button data-action="catalog" class="nav-btn ${screen === 'catalog' ? 'active' : ''}" aria-label="${t('nav.catalog')}"><span class="nav-icon" aria-hidden="true">⌂</span><span class="nav-label">${t('nav.catalog')}</span></button><button data-action="stats" class="nav-btn ${screen === 'stats' ? 'active' : ''}" aria-label="${t('nav.stats')}"><span class="nav-icon" aria-hidden="true">↗</span><span class="nav-label">${t('nav.stats')}</span></button>`;
  const mark = `<svg class="brand-icon" viewBox="0 0 48 48" aria-hidden="true"><circle class="brand-icon-ring" cx="24" cy="24" r="17"/><circle class="brand-icon-dot dot-one" cx="17" cy="18" r="3.5"/><circle class="brand-icon-dot dot-two" cx="31" cy="18" r="3.5"/><circle class="brand-icon-dot dot-three" cx="24" cy="31" r="3.5"/></svg>`;
  root.innerHTML = `<main class="shell ${data.activeGame ? 'gameplay' : 'catalog-shell'}"><header><button class="brand" data-action="catalog" aria-label="Pocket Circle"><span class="brand-mark">${mark}</span><span class="brand-word"><strong>POCKET CIRCLE</strong><small>LOCAL PARTY GAMES</small></span></button><div class="header-actions">${nav}<button data-action="language" class="language" aria-label="${t(data.language === 'it' ? 'language.switchToEnglish' : 'language.switchToItalian')}">${data.language.toUpperCase()}</button>${button('rules', '?', 'icon-btn', false, t('rules.open'))}</div></header>${error ? `<div class="error-banner" role="alert">${escape(error)}${button('retry', t('action.retry'), 'text-btn')}</div>` : ''}${content}<footer><span>◈</span> ${t('footer.onePhone')}<span>·</span>${t('footer.onDevice')}</footer></main>${dialogView()}`;
  if (resetScroll) resetScrollToTop();
  root.querySelector('[data-action="rules"]')?.setAttribute('aria-label', t('rules.open'));
  const modal = root.querySelector('dialog');
  if (modal) {
    modal.showModal();
    modal.addEventListener('cancel', () => { dialog = null; editingPlayerId = null; deletingPlayerId = null; photoError = ''; });
    modal.addEventListener('click', e => { if (e.target === modal) { dialog = null; editingPlayerId = null; deletingPlayerId = null; photoError = ''; render(); } });
    root.querySelector<HTMLInputElement>('#name')?.focus();
  }
  scheduleBomb();
}

function scheduleBomb(): void {
  if (bombTimer !== null) window.clearInterval(bombTimer);
  bombTimer = null;
  const game = data.activeGame;
  if (!game || game.gameId !== 'bomb' || game.phase !== 'playing') return;
  const tick = () => {
    const active = data.activeGame;
    if (!active || active.gameId !== 'bomb' || active.phase !== 'playing') { if (bombTimer !== null) window.clearInterval(bombTimer); bombTimer = null; return; }
    if (bombExpired(active) && bombExpiryAttemptedGameId !== active.id) {
      if (busy || bombExpiryInFlight) return;
      if (bombTimer !== null) window.clearInterval(bombTimer);
      bombTimer = null;
      bombExpiryAttemptedGameId = active.id;
      void finishBomb(active.deadlineAt);
    }
  };
  bombTimer = window.setInterval(tick, 250);
  tick();
}

function clearBombExplosionFeedback(): void {
  bombExplosionFeedback = false;
  if (bombExplosionFeedbackTimer !== null) window.clearTimeout(bombExplosionFeedbackTimer);
  bombExplosionFeedbackTimer = null;
}

function showBombExplosionFeedback(): void {
  clearBombExplosionFeedback();
  bombExplosionFeedback = true;
  render();
  bombExplosionFeedbackTimer = window.setTimeout(() => {
    bombExplosionFeedback = false;
    bombExplosionFeedbackTimer = null;
    if (data.activeGame?.gameId === 'bomb' && data.activeGame.phase === 'assigning') render();
  }, 700);
}

async function finishBomb(deadlineAt: number): Promise<void> {
  if (bombExpiryInFlight) return;
  bombExpiryInFlight = true;
  let expired = false;
  try {
    const saved = await change(next => {
      const game = next.activeGame;
      if (!game || game.gameId !== 'bomb' || game.deadlineAt !== deadlineAt || !bombExpired(game)) return;
      resolveBomb(game);
      expired = true;
    });
    if (!saved || !expired) return;
    playBombExplosion();
    navigator.vibrate?.([80, 40, 120]);
    showBombExplosionFeedback();
  } finally {
    bombExpiryInFlight = false;
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
  const stat = target.dataset.stat as keyof ImpostorStats | undefined;
  if (stat && stat in draftStats.impostor) draftStats.impostor[stat] = Number(target.value) || 0;
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
  if (data.activeGame?.gameId === 'bomb') primeBombAudio();
  const { action, player, avatar: pick, accuse, category, game: gameId, bombCategory, waveChoice } = target.dataset;
  if (gameId && gameCatalog.list().some(game => game.id === gameId)) {
    await change(next => { next.selectedGameId = gameId as GameId; });
    screen = 'setup'; location.hash = 'setup'; render(true); return;
  }
  if (bombCategory && (bombCategory === 'all' || BOMB_CATEGORIES.some(category => category.id === bombCategory))) {
    await change(next => { next.settings.bomb.category = bombCategory; }); return;
  }
  if (waveChoice !== undefined) {
    revealed = false;
    await change(next => {
      const game = next.activeGame;
      if (!game || game.gameId !== 'same-wave') return;
      submitSameWavePick(game, game.players[game.currentPlayerIndex].id, waveChoice);
      if (game.phase === 'result' && !game.scoreRecorded) { next.players = recordActiveGameResult(next.players, game); game.scoreRecorded = true; }
    });
    resetScrollToTop(); return;
  }
  if (pick && avatars.some(([id]) => id === pick)) { chosenAvatar = pick as AvatarId; photoError = ''; render(); return; }
  if (action === 'random-avatar') { chosenAvatar = avatars[Math.floor(Math.random() * avatars.length)][0]; photoError = ''; render(); return; }
  if (action === 'open-categories') { categoryScreen = true; render(true); return; }
  if (action === 'close-categories') { categoryScreen = false; render(true); return; }
  if (category && (category === 'all' || categories.includes(category as SelectableCategoryId))) {
    await change(d => {
      if (category === 'all') {
        d.settings.impostor.category = 'all';
        return;
      }
      const current = selectedCategoryIds(normalizeCategorySelection(d.settings.impostor.category)) ?? [];
      const next = current.includes(category as SelectableCategoryId)
        ? current.filter(item => item !== category)
        : [...current, category as SelectableCategoryId];
      d.settings.impostor.category = next.length === 0 ? 'all' : next.length === 1 ? next[0] : next;
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
    d.settings.impostor.impostors = Math.min(d.settings.impostor.impostors, maxImpostors(d.selectedIds.length));
    d.settings.impostor.maxAttempts = clampAttempts(d.selectedIds.length, d.settings.impostor.impostors, d.settings.impostor.maxAttempts);
  }); return; }
  if (accuse) { await change(d => { const g = d.activeGame; if (!g || g.gameId !== 'impostor' || g.eliminatedIds.includes(accuse)) return; if (g.accusedIds.includes(accuse)) g.accusedIds = g.accusedIds.filter(id => id !== accuse); else if (g.accusedIds.length < 1) g.accusedIds.push(accuse); }); return; }
  switch (action) {
    case 'retry': await init(); break;
    case 'catalog': screen = 'catalog'; categoryScreen = false; location.hash = 'catalog'; render(true); break;
    case 'stats': screen = 'stats'; categoryScreen = false; location.hash = 'stats'; render(true); break;
    case 'language': revealed = false; whoAmIRevealed = false; await change(d => { d.language = d.language === 'it' ? 'en' : 'it'; }); break;
    case 'rules': revealed = false; dialog = 'rules'; render(); break;
    case 'add': draftName = ''; draftStats = emptyPlayerStats(); editingPlayerId = null; deletingPlayerId = null; photoError = ''; chosenAvatar = avatars[Math.floor(Math.random() * avatars.length)][0]; dialog = 'player'; render(); break;
    case 'close': dialog = null; editingPlayerId = null; deletingPlayerId = null; photoError = ''; render(); break;
    case 'confirm-delete': {
      const playerId = deletingPlayerId;
      if (!playerId) break;
      await change(d => {
        d.players = d.players.filter(p => p.id !== playerId);
        d.selectedIds = d.selectedIds.filter(id => id !== playerId);
        d.settings.impostor.impostors = Math.min(d.settings.impostor.impostors, maxImpostors(d.selectedIds.length));
        d.settings.impostor.maxAttempts = clampAttempts(d.selectedIds.length, d.settings.impostor.impostors, d.settings.impostor.maxAttempts);
      });
      if (!error) { dialog = null; deletingPlayerId = null; photoError = ''; render(); }
      break;
    }
    case 'minus': await change(d => { d.settings.impostor.impostors = Math.max(1, d.settings.impostor.impostors - 1); d.settings.impostor.maxAttempts = clampAttempts(d.selectedIds.length, d.settings.impostor.impostors, d.settings.impostor.maxAttempts); }); break;
    case 'plus': await change(d => { d.settings.impostor.impostors = Math.min(maxImpostors(d.selectedIds.length), d.settings.impostor.impostors + 1); d.settings.impostor.maxAttempts = clampAttempts(d.selectedIds.length, d.settings.impostor.impostors, d.settings.impostor.maxAttempts); }); break;
    case 'attempt-minus': await change(d => { d.settings.impostor.maxAttempts = clampAttempts(d.selectedIds.length, d.settings.impostor.impostors, d.settings.impostor.maxAttempts - 1); }); break;
    case 'attempt-plus': await change(d => { d.settings.impostor.maxAttempts = clampAttempts(d.selectedIds.length, d.settings.impostor.impostors, d.settings.impostor.maxAttempts + 1); }); break;
    case 'start': categoryScreen = false; revealed = false; whoAmIRevealed = false; clearBombExplosionFeedback(); bombExpiryAttemptedGameId = null; if (data.selectedGameId === 'bomb') primeBombAudio(); await change(d => {
      const players = d.players.filter(player => d.selectedIds.includes(player.id));
      if (d.selectedGameId === 'bomb') {
        const category = d.settings.bomb.category;
        const prompts = category === 'all' ? BOMB_PROMPTS : BOMB_PROMPTS.filter(prompt => prompt.category === category);
        d.activeGame = createBombGame(players, prompts[Math.floor(Math.random() * prompts.length)]);
      } else if (d.selectedGameId === 'same-wave') {
        d.activeGame = createSameWaveGame(players, SAME_WAVE_PROMPTS[Math.floor(Math.random() * SAME_WAVE_PROMPTS.length)]);
      } else if (d.selectedGameId === 'who-am-i') {
        d.activeGame = createWhoAmIGame(players, WHO_AM_I_IDENTITIES);
      } else d.activeGame = createGame(players, d.settings.impostor);
    }); resetScrollToTop(); break;
    case 'again': categoryScreen = false; revealed = false; whoAmIRevealed = false; clearBombExplosionFeedback(); bombExpiryAttemptedGameId = null; if (data.activeGame?.gameId === 'bomb') primeBombAudio(); await change(d => {
      const game = d.activeGame;
      if (!game) return;
      if (game.gameId === 'bomb') {
        const category = d.settings.bomb.category;
        const prompts = category === 'all' ? BOMB_PROMPTS : BOMB_PROMPTS.filter(prompt => prompt.category === category);
        d.activeGame = rematchBomb(game, prompts);
      } else if (game.gameId === 'same-wave') d.activeGame = rematchSameWave(game, SAME_WAVE_PROMPTS);
      else if (game.gameId === 'who-am-i') d.activeGame = rematchWhoAmI(game, WHO_AM_I_IDENTITIES);
      else d.activeGame = createGame(game.players, d.settings.impostor, game.entry.word);
    }); resetScrollToTop(); break;
    case 'bomb-loser': clearBombExplosionFeedback(); await change(d => {
      const game = d.activeGame;
      if (!game || game.gameId !== 'bomb' || game.phase !== 'assigning' || !target.dataset.bombLoser) return;
      assignBombLoser(game, target.dataset.bombLoser);
      if (!game.scoreRecorded) { d.players = recordActiveGameResult(d.players, game); game.scoreRecorded = true; }
    }); navigator.vibrate?.([30, 40, 30]); break;
    case 'reveal': revealCard(); break;
    case 'next': revealed = false; await change(d => { const g = d.activeGame; if (!g || g.gameId !== 'impostor') return; if (g.revealIndex + 1 < g.players.length) g.revealIndex++; else g.phase = 'discuss'; }); resetScrollToTop(); break;
    case 'who-reveal': whoAmIRevealed = true; render(); break;
    case 'who-playing': whoAmIRevealed = false; await change(d => {
      const g = d.activeGame;
      if (g?.gameId !== 'who-am-i') return;
      if (g.turnIndex + 1 < g.players.length) g.turnIndex += 1;
      else { g.phase = 'playing'; g.turnIndex = 0; }
    }); resetScrollToTop(); break;
    case 'who-buzz': await change(d => { const g = d.activeGame; if (g?.gameId === 'who-am-i') buzzWhoAmI(g, g.players[g.turnIndex].id); }); break;
    case 'who-next': await change(d => { const g = d.activeGame; if (g?.gameId === 'who-am-i') nextWhoAmITurn(g, g.players[g.turnIndex].id); }); resetScrollToTop(); break;
    case 'who-correct': await change(d => { const g = d.activeGame; if (!g || g.gameId !== 'who-am-i') return; const resolution = resolveWhoAmIGuess(g, true); if (resolution === 'result' && !g.scoreRecorded) { d.players = recordActiveGameResult(d.players, g); g.scoreRecorded = true; } }); navigator.vibrate?.([30, 40, 30]); break;
    case 'who-wrong': await change(d => { const g = d.activeGame; if (!g || g.gameId !== 'who-am-i') return; const resolution = resolveWhoAmIGuess(g, false); if (resolution === 'result' && !g.scoreRecorded) { d.players = recordActiveGameResult(d.players, g); g.scoreRecorded = true; } }); navigator.vibrate?.([30, 40, 30]); break;
    case 'vote': case 'discuss': await change(d => { const game = d.activeGame; if (game?.gameId === 'impostor') game.phase = action; }); resetScrollToTop(); break;
    case 'result': await change(d => { const g = d.activeGame; if (!g || g.gameId !== 'impostor') return; const resolution = resolveVote(g); if (resolution === 'result') { g.phase = 'result'; if (!g.scoreRecorded) { d.players = recordActiveGameResult(d.players, g); g.scoreRecorded = true; } } else if (resolution === 'continue') g.phase = 'discuss'; }); navigator.vibrate?.([30, 40, 30]); resetScrollToTop(); break;
    case 'exit': revealed = false; dialog = 'exit'; editingPlayerId = null; deletingPlayerId = null; photoError = ''; render(); break;
    case 'home': categoryScreen = false; dialog = null; revealed = false; whoAmIRevealed = false; clearBombExplosionFeedback(); bombExpiryAttemptedGameId = null; screen = 'setup'; location.hash = 'setup'; await change(d => { d.activeGame = null; }); resetScrollToTop(); break;
  }
});
// Never persist an exposed card: reloads, app switching and history restore conceal it.
function hideSecret() { if (revealed || whoAmIRevealed) { revealed = false; whoAmIRevealed = false; render(); } }
document.addEventListener('visibilitychange', () => { if (document.hidden) hideSecret(); });
window.addEventListener('pagehide', hideSecret);
window.addEventListener('blur', hideSecret);
window.addEventListener('hashchange', () => {
  if (data.activeGame) return;
  screen = location.hash === '#stats' ? 'stats' : location.hash === '#setup' ? 'setup' : 'catalog';
  categoryScreen = false;
  render(true);
});

async function init() {
  try {
    const saved = await loadData<ActiveGame>();
    if (saved) data = saved;
    bombExpiryAttemptedGameId = null;
    clearBombExplosionFeedback();
    if (data.activeGame) {
      const migrated = structuredClone(data);
      const active = migrated.activeGame!;
      let needsSave = false;
      if (active.gameId === 'impostor') {
        const allowedAttempts = maxAttempts(active.players.length, active.impostorIds.length);
        const minimumAttempts = minAttempts(active.players.length, active.impostorIds.length);
        if (!Number.isInteger(active.maxAttempts) || active.maxAttempts < minimumAttempts || active.maxAttempts > allowedAttempts) { active.maxAttempts = clampAttempts(active.players.length, active.impostorIds.length, active.maxAttempts ?? minimumAttempts); needsSave = true; }
        if (!Number.isInteger(active.attemptsUsed)) { active.attemptsUsed = 0; needsSave = true; }
        if (!Array.isArray(active.eliminatedIds)) { active.eliminatedIds = []; needsSave = true; }
        if (!Array.isArray(active.foundImpostorIds)) { active.foundImpostorIds = []; needsSave = true; }
        if (typeof active.lastVoteWasImpostor !== 'boolean' && active.lastVoteWasImpostor !== null) { active.lastVoteWasImpostor = null; needsSave = true; }
      }
      if (active.gameId === 'bomb' && active.phase === 'playing' && bombExpired(active)) { resolveBomb(active); needsSave = true; }
      if (active.phase === 'result' && !active.scoreRecorded) { migrated.players = recordActiveGameResult(migrated.players, active); active.scoreRecorded = true; needsSave = true; }
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
        const selected = selectedCategoryIds(normalizeCategorySelection(data.settings.impostor.category)) ?? categories;
        return { language: data.language, selectedPlayers: data.selectedIds.length, impostors: data.settings.impostor.impostors, categorySelection: data.settings.impostor.category, categoryLabels: selected.map(category => categoryLabel(data.language, category)), phase: data.activeGame?.phase ?? 'setup', storageReady };
      },
    }, { signal: lifecycle.signal })).catch(() => console.warn('Game setup tool registration unavailable'));
  } catch { console.warn('Game setup tool registration unavailable'); }
  if (import.meta.hot) import.meta.hot.dispose(() => lifecycle.abort());
}

function revealCard() {
  const game = data.activeGame;
  if (!game || revealed || !((game.gameId === 'impostor' && game.phase === 'reveal') || (game.gameId === 'same-wave' && game.phase === 'picking'))) return;
  revealed = true;
  navigator.vibrate?.(18);
  render();
}
let swipeStart: { y: number; id: number } | null = null;
root.addEventListener('pointerdown', event => {
  const card = (event.target as HTMLElement).closest<HTMLElement>('#secret-card');
  const game = data.activeGame;
  if (!card || revealed || !game || !((game.gameId === 'impostor' && game.phase === 'reveal') || (game.gameId === 'same-wave' && game.phase === 'picking'))) return;
  swipeStart = { y: event.clientY, id: event.pointerId };
  card.setPointerCapture(event.pointerId);
});
root.addEventListener('pointerup', event => {
  if (swipeStart?.id === event.pointerId && swipeStart.y - event.clientY > 55) revealCard();
  swipeStart = null;
});
root.addEventListener('pointercancel', () => { swipeStart = null; });
