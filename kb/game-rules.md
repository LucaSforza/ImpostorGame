# Game rules

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

## Player statistics

When the result is revealed, every participant receives exactly one recorded game. The result winner receives a role-specific win; every other participant receives a role-specific loss. The profile stores total games played, citizen wins/losses, and impostor wins/losses. Citizen/impostor totals, overall wins/losses, and win percentage are derived. Existing snapshots without statistics are loaded with zeroed counters.
