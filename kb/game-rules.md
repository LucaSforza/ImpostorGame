# Catalog game rules

Pocket Circle offers Impostore, Bomba, Stessa Onda, and Chi sono?. Saved player profiles are shared across all games. Each completed session records per-game statistics once; exiting before result records nothing.

Every new game and rematch randomly chooses the first player. The session rotates its participant order to put that player first, preserving the other players' relative circular order and leaving the saved roster unchanged. The choice is independent each round, so the same person can legitimately start twice. The order is persisted: reload, language changes, and screen rendering do not draw a new starter. In Impostore the same player starts the private reveal and discussion; in Bomba the screen names who starts answering; in Stessa Onda that player makes the first private choice; in Chi sono? that player first views the other identities and asks the first question.

## Impostore

## Setup

1. Select 3 to 20 players saved on the device.
2. Choose 1 to `floor((players - 1) / 2)` impostors; impostors are always fewer than half of the group.
3. Choose between `impostors` and `floor((players - 1) / 2)` voting sessions. The maximum is 1 for 3–4 players, 2 for 5–6, 3 for 7–8, up to 9 for 19–20. At least one session per impostor is required. Changing selected players clamps both impostor count and the session limit to the valid range.
4. Choose one or more categories, or all categories.

The game randomly selects a `WordEntry` without repeating the previous word on rematch, assigns roles, and chooses the first player independently of those roles.

## Secret reveal

Pass the phone to each player in order. Citizens receive the same word; impostors receive only its associated hint. Before reveal, the card shows the character artwork and offers an accessible Reveal button; an upward swipe of more than 55 pixels is also accepted. Each player must hide the card before passing the phone. If the page loses visibility, the app automatically hides an open card.

The word, hint, interface, and category labels follow the current interface language. Switching language during a game re-renders the current card in the new language; the selected word, categories, roles, and game phase do not change.

## Discussion and vote

During discussion, each player takes a turn saying a word related to the secret without saying the secret itself. Players can ask questions and repeat the round. When the group is ready, move to the vote.

The vote is collective: each session selects exactly one suspect. The selected candidate is permanently removed from later vote controls. If the candidate is an impostor, that impostor is marked as found and the crew continues voting until all impostors are found; innocent selections also consume a session. The crew wins when every impostor is found. If maximum sessions are exhausted first, impostors win. The result shows the word, the impostors, and every candidate accused across sessions.

From the result screen, the group can start a rematch while keeping players and settings; the home screen allows players and rules to be changed. The active game is saved locally so it can be restored after a reload.

Compatibility: setup values saved under the older, higher attempt limit are clamped to the new range. An already-started session retains its saved valid limit so an update cannot change its rules or score halfway through; new games and rematches use the new limits.

## Bomba

1. Select 2–20 players and one topic category or all categories.
2. App chooses one bilingual topic and a random duration between 20 and 45 seconds. The deadline remains saved internally for reload recovery; remaining time is secret.
3. Players say valid unused answers aloud and manage turns themselves; app shows only the bomb and topic. There is no numerical countdown, progress bar, accessible timer, or animation that reveals how close expiry is.
4. Group resolves validity and duplicates without microphone or app controls.
5. At expiry, a short explosion sound and animation announce the end, together with a visible, accessible BOOM message. Then the group selects the player caught by the explosion. Selected player receives loss/negative point; every other player wins. No score is recorded until that choice.

The explosion sound is generated locally with Web Audio and enabled by a user gesture. If audio is unavailable or the browser blocks playback, the visible explosion and adjudication remain usable. Reduced-motion preferences disable the animation. Reloading an adjudication/result screen does not replay the explosion; a rematch gets a new random deadline.

## Stessa Onda

1. Select 3–20 players and start a prompt.
2. Pass phone privately; every player chooses one of four answers.
3. App groups matching answers after last choice.
4. Members of largest group of at least two win. All groups tied for largest win. If all answers are unique, nobody wins.

## Chi sono?

1. Select 3–20 players. App assigns each participant a unique bilingual identity: person, fictional character, or object.
2. Pass phone privately. Each player sees and memorizes every other participant's identity, never their own. Losing visibility, switching language, or leaving page hides exposed identities.
3. In persisted random order, current player asks group one yes/no question. Group answers aloud; app validates no speech. Player may pass turn without guessing.
4. Current player may buzz once and say answer aloud. App reveals their identity; group marks answer correct or wrong. Correct answer ends game with that player as sole winner. Wrong answer eliminates player and play continues with next active participant. If everyone guesses wrong, game ends without winner.
5. Rematch keeps participants, chooses new starter, and deals identities unused in previous round when enough content exists.

## Player statistics

When a result is revealed, every participant receives exactly one recorded game for that `GameId`. Winners receive one win and other participants one loss; Stessa Onda and Chi sono? can produce no winners. Overall games, wins, losses, and rate are derived from per-game values. Impostore also records citizen/impostor role splits. Existing snapshots gain zeroed Chi sono? counters and default settings in memory.
