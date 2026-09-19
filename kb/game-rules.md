# Game rules

## Setup

1. Select 3 to 20 players saved on the device.
2. Choose 1 to `floor((players - 1) / 2)` impostors; impostors are always fewer than half of the group.
3. Choose one or more categories, or all categories.

The game randomly selects a `WordEntry`, assigns roles without repeating the previous word when starting a rematch, and chooses a player to break the ice.

## Secret reveal

Pass the phone to each player in order. Citizens receive the same word; impostors receive only its associated hint. Before reveal, the card shows the character artwork and offers an accessible Reveal button; an upward swipe of more than 55 pixels is also accepted. Each player must hide the card before passing the phone. If the page loses visibility, the app automatically hides an open card.

The word, hint, interface, and category labels follow the current interface language. Switching language during a game re-renders the current card in the new language; the selected word, categories, roles, and game phase do not change.

## Discussion and vote

During discussion, each player takes a turn saying a word related to the secret without saying the secret itself. Players can ask questions and repeat the round. When the group is ready, move to the vote.

The vote is collective: the group selects exactly as many suspects as there are impostors. The crew wins only when every impostor is among the accused and no innocent player is accused. In every other case, the impostors win. The result shows the word, the impostors, and the accused players.

From the result screen, the group can start a rematch while keeping players and settings; the home screen allows players and rules to be changed. The active game is saved locally so it can be restored after a reload.
