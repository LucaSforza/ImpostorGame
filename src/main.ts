import './style.css';
import { loadData, saveData, type AppData, type Player } from './db';
import { createGame, maxImpostors, citizensWin, type Game } from './game';
import { categories } from './words';
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

const root = document.querySelector<HTMLDivElement>('#app')!;
const avatars = [
  ['avatar-01', 'Cometa', avatar01], ['avatar-02', 'Ribelle', avatar02], ['avatar-03', 'Lampo', avatar03], ['avatar-04', 'Nebbia', avatar04],
  ['avatar-05', 'Braciere', avatar05], ['avatar-06', 'Marea', avatar06], ['avatar-07', 'Cobalto', avatar07], ['avatar-08', 'Corallo', avatar08],
  ['avatar-09', 'Guscio', avatar09], ['avatar-10', 'Piuma', avatar10], ['avatar-11', 'Ombra', avatar11], ['avatar-12', 'Pixel', avatar12],
  ['avatar-13', 'Zefiro', avatar13], ['avatar-14', 'Radice', avatar14], ['avatar-15', 'Prisma', avatar15], ['avatar-16', 'Turbine', avatar16],
] as const;
type AvatarId = typeof avatars[number][0];
const legacyAvatarMap: Record<string, AvatarId> = {
  '😎': 'avatar-01', '👽': 'avatar-02', '🦊': 'avatar-03', '👻': 'avatar-04',
  '🐸': 'avatar-05', '🤖': 'avatar-06', '🐼': 'avatar-07', '🦄': 'avatar-08',
  '🐙': 'avatar-09', '🔥': 'avatar-10', '🐱': 'avatar-11', '🕵️': 'avatar-12',
};
let data: AppData<Game> = { players: [], selectedIds: [], settings: { impostors: 1, category: 'all' }, activeGame: null, language: 'it' };
let revealed = false;
let busy = false;
let storageReady = false;
let error = '';
let dialog: 'player' | 'rules' | 'exit' | 'delete' | null = null;
let chosenAvatar: string = avatars[0][0];
let draftName = '';
let editingPlayerId: string | null = null;
let deletingPlayerId: string | null = null;
let photoError = '';
const t = (it: string, en: string) => data.language === 'it' ? it : en;
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const categoryName = (c: string) => ({ all: t('Tutte le categorie', 'All categories'), Cibo: t('Cibo', 'Food'), Luoghi: t('Luoghi', 'Places'), Oggetti: t('Oggetti', 'Objects'), Animali: t('Animali', 'Animals'), Sport: 'Sport', Cinema: t('Cinema', 'Movies') }[c] ?? c);
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

function playerCard(p: Player): string {
  const included = data.selectedIds.includes(p.id);
  const disabled = busy || !storageReady;
  return `<div class="player-row"><button class="player ${included ? 'selected' : ''}" data-player="${p.id}" aria-pressed="${included}" ${disabled ? 'disabled' : ''}>${avatar(p)}<span>${escape(p.name)}</span><span class="check" aria-hidden="true">${included ? '✓' : '+'}</span></button><div class="player-actions"><button type="button" class="player-action" data-action="edit-player" data-player="${p.id}" aria-label="${t('Modifica', 'Edit')} ${escape(p.name)}" ${disabled ? 'disabled' : ''}>${t('Modifica', 'Edit')}</button><button type="button" class="player-action danger" data-action="delete-player" data-player="${p.id}" aria-label="${t('Elimina', 'Delete')} ${escape(p.name)}" ${disabled ? 'disabled' : ''}>${t('Elimina', 'Delete')}</button></div></div>`;
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
    error = t('Salvataggio non riuscito. Libera spazio o abilita i dati del sito e riprova.', 'Could not save. Free up space or enable site storage and try again.');
  } finally { busy = false; render(); }
}

function setup(): string {
  const count = data.selectedIds.length;
  return `<section class="cover"><div class="cover-art"></div><div class="cover-copy"><span class="eyebrow">${t('IL PARTY GAME DEI SOSPETTI', 'THE SUSPICIOUS PARTY GAME')}</span><h1>${t('Fidati di<br><em>nessuno.</em>', 'Trust<br><em>no one.</em>')}</h1><p>${t('Una parola. Qualche bugia.<br>Un solo telefono.', 'One word. A few lies.<br>One phone.')}</p></div><span class="cover-tag">${t('TRA AMICI, SENZA FILTRI.', 'GOOD FRIENDS. GREAT LIARS.')}</span><span class="spark">✦</span></section>
  <section class="setup"><div class="section-heading"><div><span class="eyebrow">${t('RADUNA LA TUA CREW', 'ROUND UP YOUR CREW')}</span><h2>${t('Chi gioca?', "Who's playing?")}</h2></div><span class="count">${count}/20</span></div>
  ${data.players.length ? `<p class="helper">${t('Tocca un personaggio per includerlo o escluderlo. Usa Modifica o Elimina per gestirlo.', 'Tap a character to include or exclude them. Use Edit or Delete to manage them.')}</p><div class="players">${data.players.map(playerCard).join('')}</div>` : `<div class="empty"><span>✦</span><p>${t('Ogni faccia nasconde qualcosa.<br>Aggiungi il primo giocatore.', 'Every face hides something.<br>Add your first player.')}</p></div>`}
  ${button('add', `＋ ${t('Nuovo personaggio', 'New character')}`, 'secondary', !storageReady)}
  <div class="setting"><div><strong>${t('Impostori', 'Impostors')}</strong><small>${t('Conoscono solo un indizio.', 'They only get a hint.')}</small></div><div class="stepper"><button data-action="minus" aria-label="${t('Meno impostori', 'Fewer impostors')}" ${data.settings.impostors <= 1 || busy ? 'disabled' : ''}>−</button><b>${data.settings.impostors}</b><button data-action="plus" aria-label="${t('Più impostori', 'More impostors')}" ${data.settings.impostors >= maxImpostors(count) || busy ? 'disabled' : ''}>+</button></div></div>
  <div class="setting"><label for="category"><strong>${t('Il mazzo', 'The deck')}</strong><small>${t('120 parole, infinite facce sospette.', '120 words. Endless suspicious looks.')}</small></label><select id="category" ${busy ? 'disabled' : ''}>${['all', ...categories].map(c => `<option value="${c}" ${data.settings.category === c ? 'selected' : ''}>${categoryName(c)}</option>`).join('')}</select></div>
  ${button('start', `${t('Inizia la partita', 'Start the game')} <span>↗</span>`, 'primary', count < 3 || !storageReady)}
  <p class="footnote">${count < 3 ? t(`Aggiungi ancora ${3 - count} giocator${3 - count === 1 ? 'e' : 'i'} per iniziare.`, `Add ${3 - count} more player${3 - count === 1 ? '' : 's'} to start.`) : t('Passatevi il telefono. Tenetevi i segreti.', 'Pass the phone. Keep your secrets.')}</p></section>`;
}

function gameView(g: Game): string {
  const p = g.players[g.revealIndex];
  const gameWord = g.language === 'it' ? g.entry.word : g.entry.wordEn;
  const hint = g.language === 'it' ? g.entry.hint : g.entry.hintEn;
  const phaseLabel = { reveal: t('I SEGRETI', 'THE SECRETS'), discuss: t('I SOSPETTI', 'THE SUSPICIONS'), vote: t('IL VERDETTO', 'THE VERDICT'), result: t('LA VERITÀ', 'THE TRUTH') }[g.phase];
  const top = `<div class="round-top">${button('exit', '←', 'icon-btn')}<span class="eyebrow">${phaseLabel}</span><span class="count">${g.players.length} ${t('amici', 'friends')}</span></div>`;
  if (g.phase === 'reveal') {
    const impostor = g.impostorIds.includes(p.id);
    return `<div class="game-logo"><span>${t("TROVA L’", "FIND THE")}</span><strong>${t("IMPOSTORE", "IMPOSTOR")}</strong></div>${top}<div class="progress" aria-label="${g.revealIndex + 1}/${g.players.length}">${g.players.map((_, i) => `<i class="${i <= g.revealIndex ? 'done' : ''}"></i>`).join('')}</div><section class="game-screen"><p class="eyebrow">${t('PASSA IL TELEFONO A', 'PASS THE PHONE TO')}</p><h1 class="player-title">${escape(p.name)}</h1><p class="helper">${t('Gli altri guardano altrove. Niente sbirciate.', 'Everyone else looks away. No peeking.')}</p><div id="secret-card" class="secret-card ${revealed ? 'flipped' : ''}">${revealed ? `<span class="role-label">${impostor ? t('SEI UN IMPOSTORE', 'YOU ARE AN IMPOSTOR') : t('SEI DELLA CREW', 'YOU ARE CREW')}</span><span class="secret-icon">${impostor ? '🕵️' : '🤫'}</span><p>${impostor ? t('Il tuo indizio è', 'Your hint is') : t('La parola segreta è', 'The secret word is')}</p><h2 class="secret-word">${escape(impostor ? hint : gameWord)}</h2><p class="helper">${impostor ? t('Mimetizzati. Ascolta. Inventati qualcosa.', 'Blend in. Listen. Make something up.') : t('Fatti capire, senza dire troppo.', 'Be clear, without giving too much away.')}</p>` : `${avatarArt(p.avatar)}${avatar(p, 'character-badge')}<div class="swipe-prompt"><span>↑</span><b>${t('Scorri su per scoprire', 'Swipe up to reveal')}</b><small>${t('oppure usa il pulsante qui sotto', 'or use the button below')}</small></div>`}</div>${revealed ? button('next', `${t('Nascondi e passa', 'Hide and pass')} <span>→</span>`) : button('reveal', `${t('Sono', "I'm")} ${escape(p.name)} · ${t('Mostra', 'Reveal')} <span>◈</span>`)}<p class="footnote">${g.revealIndex + 1} ${t('di', 'of')} ${g.players.length} · ${t('Il segreto si nasconde se cambi app.', 'Switching apps hides the secret.')}</p></section>`;
  }
  if (g.phase === 'discuss') {
    const starter = g.players.find(x => x.id === g.starterId)!;
    return `${top}<section class="game-screen"><span class="big-symbol">✦</span><h1>${t('Ora, mentite<br><em>bene.</em>', 'Now, lie<br><em>well.</em>')}</h1><p class="helper">${t('A turno, dite una parola legata al segreto.<br>Gli impostori devono confondersi tra voi.', 'Take turns saying a word related to the secret.<br>Impostors need to blend in.')}</p><div class="starter">${avatar(starter)}<div><small>${t('ROMPE IL GHIACCIO', 'BREAKS THE ICE')}</small><strong>${escape(starter.name)}</strong></div></div><div class="tip"><b>${t('Fatevi delle domande.', 'Ask each other questions.')}</b><p>${t('Ripetete il giro quanto volete. Quando avete un sospetto, decidete insieme chi accusare.', 'Play as many rounds as you like. When you have a suspicion, decide together who to accuse.')}</p></div>${button('vote', `${t('Al voto', 'Time to vote')} <span>→</span>`)}</section>`;
  }
  if (g.phase === 'vote') return `${top}<section class="game-screen"><p class="eyebrow">${t('FIDATI DEL TUO ISTINTO', 'TRUST YOUR GUT')}</p><h1>${t('Chi sta<br><em>bluffando?</em>', "Who's<br><em>bluffing?</em>")}</h1><p class="helper">${t(`Decidete insieme e selezionate ${g.impostorIds.length} sospett${g.impostorIds.length === 1 ? 'o' : 'i'}. In caso di parità, discutete ancora.`, `Decide together and select ${g.impostorIds.length} suspect${g.impostorIds.length === 1 ? '' : 's'}. If tied, discuss again.`)}</p><div class="players vote-players">${g.players.map(p => `<button class="player ${g.accusedIds.includes(p.id) ? 'selected' : ''}" data-accuse="${p.id}" aria-pressed="${g.accusedIds.includes(p.id)}">${avatar(p)}<span>${escape(p.name)}</span><span class="check">${g.accusedIds.includes(p.id) ? '✓' : '+'}</span></button>`).join('')}</div>${button('result', `${t('Svela la verità', 'Reveal the truth')} <span>✦</span>`, 'primary', g.accusedIds.length !== g.impostorIds.length)}${button('discuss', t('Torniamo a discutere', 'Back to discussion'), 'text-btn')}</section>`;
  return `${top}<section class="game-screen result"><div class="confetti" aria-hidden="true">✦ · ✧ · ✦</div><span class="big-symbol">${citizensWin(g) ? '🏆' : '🕵️'}</span><p class="eyebrow">${t('MASCHERE GIÙ', 'MASKS OFF')}</p><h1>${citizensWin(g) ? t('Beccati.<br><em>Vince la crew!</em>', 'Busted.<br><em>Crew wins!</em>') : t('Che bluff.<br><em>Vincono gli impostori!</em>', 'What a bluff.<br><em>Impostors win!</em>')}</h1><p class="helper">${t('La parola segreta era', 'The secret word was')}</p><h2 class="answer">${escape(gameWord)}</h2><div class="reveal-list">${g.players.filter(p => g.impostorIds.includes(p.id)).map(p => `<div>${avatar(p)}<strong>${escape(p.name)}</strong><span>${t('Impostore', 'Impostor')}</span></div>`).join('')}</div><p class="helper">${t('Avete accusato:', 'You accused:')} ${g.players.filter(p => g.accusedIds.includes(p.id)).map(p => escape(p.name)).join(', ')}</p>${button('again', `${t('Rivincita', 'Play again')} <span>↻</span>`)}${button('home', t('Cambia giocatori e regole', 'Change players and rules'), 'text-btn')}</section>`;
}

function playerDialogView(): string {
  const editing = editingPlayerId ? data.players.find(p => p.id === editingPlayerId) : null;
  const title = editing ? t('Modifica personaggio.', 'Edit character.') : t('Una nuova faccia.', 'A new face.');
  const helper = editing ? t('Aggiorna nome o avatar. Le partite future useranno questi dati.', 'Update the name or avatar. Future games will use these details.') : t('Il personaggio resta salvato per le prossime partite.', 'Your character is saved for future games.');
  const submit = editing ? t('Salva modifiche', 'Save changes') : t('Aggiungi alla crew', 'Add to the crew');
  return `<h2 id="dialog-title">${title}</h2><p class="helper">${helper}</p><form id="player-form"><label for="name">${t('Nome o soprannome', 'Name or nickname')}</label><input id="name" name="name" placeholder="${t('Come ti chiami?', "What's your name?")}" value="${escape(draftName)}" maxlength="24" required autocomplete="off"/><span class="field-label">${t('Scegli la tua faccia', 'Pick your face')}</span><div class="avatar-upload">${avatarMarkup(chosenAvatar, 'avatar-preview')}<div><label class="upload-label" for="avatar-upload">${t('Carica o scatta foto', 'Upload or take photo')}</label><input id="avatar-upload" type="file" accept="image/*" capture="user"/></div></div><p class="upload-hint">${t('La foto resta solo su questo dispositivo.', 'The photo stays on this device.')}</p><button type="button" class="avatar-random" data-action="random-avatar">${t('Avatar casuale', 'Random avatar')}</button><div class="avatar-picker">${avatars.map(([id, label], index) => `<button type="button" data-avatar="${id}" aria-label="${t(`Avatar ${index + 1}: ${label}`, `Avatar ${index + 1}: ${label}`)}" aria-pressed="${id === chosenAvatar}" class="${id === chosenAvatar ? 'chosen' : ''}">${avatarMarkup(id)}</button>`).join('')}</div><p id="form-error" class="error" role="alert"></p><p class="error upload-error" role="alert">${escape(photoError)}</p><button class="primary" type="submit">${submit} <span>${editing ? '✓' : '＋'}</span></button></form>`;
}

function deleteDialogView(): string {
  const player = deletingPlayerId ? data.players.find(p => p.id === deletingPlayerId) : null;
  if (!player) return '';
  return `<h2 id="dialog-title">${t('Eliminare questo personaggio?', 'Delete this character?')}</h2><p class="helper">${t(`“${escape(player.name)}” verrà rimosso dalla crew e dalle selezioni.`, `“${escape(player.name)}” will be removed from the crew and selections.`)}</p>${button('confirm-delete', t('Sì, elimina', 'Yes, delete'))}${button('close', t('Annulla', 'Cancel'), 'text-btn')}`;
}

function dialogView(): string {
  if (!dialog) return '';
  let content = '';
  if (dialog === 'player') content = playerDialogView();
  if (dialog === 'rules') content = `<h2 id="dialog-title">${t('Amici. Bugie. Sospetti.', 'Friends. Lies. Suspicions.')}</h2><ol class="rules"><li><b>${t('Prepara la crew', 'Get the crew ready')}</b><p>${t('Scegli da 3 a 20 giocatori e quanti impostori volete. Gli impostori devono essere meno della metà.', 'Choose 3–20 players and your impostor count. Impostors must be fewer than half the group.')}</p></li><li><b>${t('Passa il telefono', 'Pass the phone')}</b><p>${t('Ognuno guarda la propria carta in segreto. La crew riceve la stessa parola; gli impostori ricevono solo un indizio.', 'Everyone checks their card in secret. Crew members get the same word; impostors get only a hint.')}</p></li><li><b>${t('Parla, ascolta, bluffa', 'Talk, listen, bluff')}</b><p>${t('A turno dite una parola collegata. Non pronunciate la parola segreta! Fate domande e ripetete i giri.', 'Take turns giving a related word. Never say the secret word! Ask questions and repeat rounds.')}</p></li><li><b>${t('Svela gli impostori', 'Catch the impostors')}</b><p>${t('Accusate insieme tanti giocatori quanti sono gli impostori. Se li trovate tutti, vince la crew. Altrimenti vincono gli impostori.', 'Together accuse as many players as there are impostors. Catch them all and the crew wins. Otherwise impostors win.')}</p></li></ol><p class="privacy">${t('Personaggi e partita restano solo in questo browser. Cancellando i dati del sito, li perderai.', 'Characters and your game stay only in this browser. Clearing site data deletes them.')}</p>`;
  if (dialog === 'exit') content = `<h2 id="dialog-title">${t('Interrompere la partita?', 'End this game?')}</h2><p class="helper">${t('I personaggi restano salvati. Questa partita verrà abbandonata.', 'Your characters stay saved. This game will be abandoned.')}</p>${button('home', t('Sì, torna alla crew', 'Yes, back to the crew'))}`;
  if (dialog === 'delete') content = deleteDialogView();
  return `<dialog aria-labelledby="dialog-title"><div class="dialog-inner">${button('close', '<span aria-hidden="true">×</span>', 'close icon-btn', false, t('Chiudi', 'Close'))}${content}</div></dialog>`;
}

function render(): void {
  document.documentElement.lang = data.language;
  document.body.classList.add('is-playing');
  document.title = t('Impostor — Fidati di nessuno.', 'Impostor — Trust no one.');
  root.innerHTML = `<main class="shell gameplay"><header><a class="brand" href="./" aria-label="Impostor"><span class="brand-mark">◈</span> IMPOSTOR</a><div class="header-actions"><button data-action="language" class="language" aria-label="${t('Switch to English', 'Passa a italiano')}">${data.language.toUpperCase()} <span>⌄</span></button>${button('rules', '?', 'icon-btn')}</div></header>${error ? `<div class="error-banner" role="alert">${escape(error)}${!storageReady ? button('retry', t('Riprova', 'Retry'), 'text-btn') : ''}</div>` : ''}${data.activeGame ? gameView(data.activeGame) : setup()}<footer><span>◈</span> ${t('Un telefono. Solo voi.', 'One phone. Just you.')}<span>·</span>${t('Tutto sul dispositivo', 'Everything on-device')}</footer></main>${dialogView()}`;
  root.querySelector('[data-action="rules"]')?.setAttribute('aria-label', t('Come si gioca', 'How to play'));
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

root.addEventListener('input', e => { if ((e.target as HTMLElement).id === 'name') draftName = (e.target as HTMLInputElement).value; });
root.addEventListener('change', e => {
  const target = e.target as HTMLInputElement | HTMLSelectElement;
  if (target.id === 'category') { void change(d => { d.settings.category = (target as HTMLSelectElement).value; }); return; }
  if (target.id === 'avatar-upload') {
    const file = (target as HTMLInputElement).files?.[0];
    if (!file) return;
    void readAvatarPhoto(file).then(photo => { chosenAvatar = photo; photoError = ''; render(); }).catch(() => { photoError = t('Immagine non valida. Scegline un’altra.', 'Invalid image. Choose another one.'); render(); });
  }
});
root.addEventListener('submit', async e => {
  e.preventDefault();
  const name = draftName.trim().replace(/\s+/g, ' ');
  if (!name || name.length > 24 || data.players.some(p => p.id !== editingPlayerId && p.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    root.querySelector('#form-error')!.textContent = t('Scegli un nome unico, da 1 a 24 caratteri.', 'Choose a unique name, 1–24 characters long.');
    return;
  }
  const playerId = editingPlayerId;
  await change(d => {
    if (playerId) {
      const player = d.players.find(p => p.id === playerId);
      if (player) { player.name = name; player.avatar = chosenAvatar; }
    } else {
      const player = { id: crypto.randomUUID(), name, avatar: chosenAvatar, createdAt: Date.now() };
      d.players.push(player);
      if (d.selectedIds.length < 20) d.selectedIds.push(player.id);
    }
  });
  if (!error) { dialog = null; editingPlayerId = null; photoError = ''; render(); }
});
root.addEventListener('click', async e => {
  const target = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!target || target.disabled || busy) return;
  const { action, player, avatar: pick, accuse } = target.dataset;
  if (pick && avatars.some(([id]) => id === pick)) { chosenAvatar = pick as AvatarId; photoError = ''; render(); return; }
  if (action === 'random-avatar') { chosenAvatar = avatars[Math.floor(Math.random() * avatars.length)][0]; photoError = ''; render(); return; }
  if (action === 'edit-player' && player) {
    const current = data.players.find(p => p.id === player);
    if (!current) return;
    editingPlayerId = player;
    deletingPlayerId = null;
    draftName = current.name;
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
  }); return; }
  if (accuse) { await change(d => { const g = d.activeGame!; if (g.accusedIds.includes(accuse)) g.accusedIds = g.accusedIds.filter(id => id !== accuse); else if (g.accusedIds.length < g.impostorIds.length) g.accusedIds.push(accuse); }); return; }
  switch (action) {
    case 'retry': await init(); break;
    case 'language': revealed = false; await change(d => { d.language = d.language === 'it' ? 'en' : 'it'; }); break;
    case 'rules': revealed = false; dialog = 'rules'; render(); break;
    case 'add': draftName = ''; editingPlayerId = null; deletingPlayerId = null; photoError = ''; chosenAvatar = avatars[Math.floor(Math.random() * avatars.length)][0]; dialog = 'player'; render(); break;
    case 'close': dialog = null; editingPlayerId = null; deletingPlayerId = null; photoError = ''; render(); break;
    case 'confirm-delete': {
      const playerId = deletingPlayerId;
      if (!playerId) break;
      await change(d => {
        d.players = d.players.filter(p => p.id !== playerId);
        d.selectedIds = d.selectedIds.filter(id => id !== playerId);
        d.settings.impostors = Math.min(d.settings.impostors, maxImpostors(d.selectedIds.length));
      });
      if (!error) { dialog = null; deletingPlayerId = null; photoError = ''; render(); }
      break;
    }
    case 'minus': await change(d => { d.settings.impostors = Math.max(1, d.settings.impostors - 1); }); break;
    case 'plus': await change(d => { d.settings.impostors = Math.min(maxImpostors(d.selectedIds.length), d.settings.impostors + 1); }); break;
    case 'start': case 'again': revealed = false; await change(d => { d.activeGame = createGame(selected(), d.settings, d.language, d.activeGame?.entry.word); }); window.scrollTo(0, 0); break;
    case 'reveal': revealCard(); break;
    case 'next': revealed = false; await change(d => { const g = d.activeGame!; if (g.revealIndex + 1 < g.players.length) g.revealIndex++; else g.phase = 'discuss'; }); window.scrollTo(0, 0); break;
    case 'vote': case 'discuss': await change(d => { d.activeGame!.phase = action; }); window.scrollTo(0, 0); break;
    case 'result': await change(d => { const g = d.activeGame!; if (g.accusedIds.length === g.impostorIds.length) g.phase = 'result'; }); navigator.vibrate?.([30, 40, 30]); window.scrollTo(0, 0); break;
    case 'exit': revealed = false; dialog = 'exit'; editingPlayerId = null; deletingPlayerId = null; photoError = ''; render(); break;
    case 'home': dialog = null; revealed = false; await change(d => { d.activeGame = null; }); window.scrollTo(0, 0); break;
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
    storageReady = true;
    error = '';
    if (!saved) await saveData(data);
  } catch {
    storageReady = false;
    error = t('Archivio locale non disponibile. Abilita i dati del sito per giocare.', 'Local storage is unavailable. Enable site storage to play.');
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
        return { language: data.language, selectedPlayers: data.selectedIds.length, impostors: data.settings.impostors, category: data.settings.category, phase: data.activeGame?.phase ?? 'setup', storageReady };
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
