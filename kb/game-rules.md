# Catalog game rules

Pocket Circle offers Impostore, Bomba, and Stessa Onda. Saved player profiles are shared across all games. Each completed session records per-game statistics once; exiting before result records nothing.

## Impostore

## Setup

1. Select 3 to 20 players saved on the device.
2. Choose 1 to `floor((players - 1) / 2)` impostors; impostors are always fewer than half of the group.
3. Choose `impostors` to `players` maximum voting sessions. At least one session per impostor is required; no more than one session per player is useful because each session removes one candidate.
4. Choose one or more categories, or all categories.

The game randomly selects a `WordEntry`, assigns roles without repeating the previous word when starting a rematch, and chooses a player to break the ice.

## Secret reveal

Pass the phone to each player in order. Citizens receive the same word; impostors receive only its associated hint. Before reveal, the card shows the character artwork and offers an accessible Reveal button; an upward swipe of more than 55 pixels is also accepted. Each player must hide the card before passing the phone. If the page loses visibility, the app automatically hides an open card.

The word, hint, interface, and category labels follow the current interface language. Switching language during a game re-renders the current card in the new language; the selected word, categories, roles, and game phase do not change.

## Discussion and vote

During discussion, each player takes a turn saying a word related to the secret without saying the secret itself. Players can ask questions and repeat the round. When the group is ready, move to the vote.

The vote is collective: each session selects exactly one suspect. The selected candidate is permanently removed from later vote controls. If the candidate is an impostor, that impostor is marked as found and the crew continues voting until all impostors are found; innocent selections also consume a session. The crew wins when every impostor is found. If maximum sessions are exhausted first, impostors win. The result shows the word, the impostors, and every candidate accused across sessions.

From the result screen, the group can start a rematch while keeping players and settings; the home screen allows players and rules to be changed. The active game is saved locally so it can be restored after a reload.

## Bomba

1. Select 2–20 players and one topic category or all categories.
2. App chooses one bilingual topic and starts a random timer between 20 and 45 seconds.
3. Players say valid unused answers aloud and manage turns themselves; app shows only bomb/timer and topic.
4. Group resolves validity and duplicates without microphone or app controls.
5. When timer expires, group selects player caught by explosion. Selected player receives loss/negative point; every other player wins.

## Stessa Onda

1. Select 3–20 players and start a prompt.
2. Pass phone privately; every player chooses one of four answers.
3. App groups matching answers after last choice.
4. Members of largest group of at least two win. All groups tied for largest win. If all answers are unique, nobody wins.

## Player statistics

When a result is revealed, every participant receives exactly one recorded game for that `GameId`. Winners receive one win and other participants one loss; Stessa Onda can produce no winners. Overall games, wins, losses, and rate are derived from per-game values. Impostore also records citizen/impostor role splits. Existing single-game snapshots migrate into Impostore values.
