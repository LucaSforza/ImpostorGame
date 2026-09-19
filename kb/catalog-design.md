# Pocket Circle product design

Pocket Circle is a local-first catalog of pass-and-play party games. One phone is shared by friends; profiles, settings, sessions, and statistics stay in that browser. The app contains no advertising, analytics, accounts, or runtime network calls.

## Product structure

The landing screen is a game catalog. Each catalog entry has stable metadata, supported player limits, localized copy, and a setup renderer. Selecting an entry opens that game's setup while reusing the same saved player profiles. The header exposes a separate statistics page at `#stats`; returning to the catalog uses `#catalog`.

`GameCatalog` is the only registry of available games. It owns immutable `GameDefinition` values and resolves them by stable `GameId`. Runtime sessions are a discriminated `ActiveGame` union, so each game keeps only its own rules while persistence and rendering can exhaustively dispatch on `gameId`.

```mermaid
classDiagram
  class GameCatalog {
    +GameDefinition[] games
    +list() GameDefinition[]
    +get(GameId) GameDefinition
  }
  class GameDefinition {
    +GameId id
    +string nameKey
    +string descriptionKey
    +number minPlayers
    +number maxPlayers
  }
  class AppData {
    +Player[] players
    +string[] selectedIds
    +GameId selectedGameId
    +SettingsByGame settings
    +Locale language
    +ActiveGame activeGame
  }
  class Player {
    +string id
    +string name
    +string avatar
    +number createdAt
    +PlayerStats stats
  }
  class PlayerStats {
    +GameStats impostor
    +GameStats bomb
    +GameStats sameWave
  }
  class GameStats {
    +number gamesPlayed
    +number wins
    +number losses
  }
  class ActiveGame {
    <<union>>
    +GameId gameId
    +string id
    +Player[] players
    +boolean scoreRecorded
  }
  class ImpostorGame
  class BombGame
  class SameWaveGame

  GameCatalog "1" o-- "3" GameDefinition : offers
  AppData "1" o-- "0..*" Player : reusable profiles
  Player "1" *-- "1" PlayerStats : owns
  PlayerStats "1" *-- "3" GameStats : per game
  AppData "1" o-- "0..1" ActiveGame : resumes
  ActiveGame <|-- ImpostorGame
  ActiveGame <|-- BombGame
  ActiveGame <|-- SameWaveGame
  ActiveGame "1" o-- "2..20" Player : participants
```

Profiles belong to `AppData`, not to any game. Every session snapshots participating profiles for stable names and avatars, while result recording updates canonical profiles by ID. Overall totals and win percentage are derived by summing three `GameStats` records; no duplicate aggregate counter is persisted.

## Catalog games

### Impostore

Existing hidden-role game remains behavior-compatible: 3–20 players, configurable impostor count and voting attempts, bilingual word categories, private reveal, discussion, progressive voting, and rematch. Existing citizen/impostor role counters remain available as an Impostore-specific breakdown in addition to generic wins and losses.

### Bomba

Two to twenty players choose a bilingual topic category such as tech companies. A round displays the topic and starts a hidden random deadline between 20 and 45 seconds. Current player says a valid, unused answer aloud, taps `Detto`, and passes the phone; app increments answer count and advances to next player. Group judges validity and duplicates: no microphone or remote service is used. When deadline expires, current holder loses and every other participant wins. Reload resumes from persisted absolute deadline; an already elapsed deadline resolves immediately. A rematch keeps players and topic selection but chooses a new prompt and deadline.

Bomb content is data-driven. Each `BombPrompt` has stable ID, category ID, Italian/English topic, and bilingual examples used only as optional inspiration before round starts. Runtime never downloads content.

### Stessa Onda

Three to twenty players receive same light-hearted prompt with four localized choices. Phone passes privately; each player selects one answer without seeing earlier choices. Result groups players by answer. Every player in a largest group of at least two wins; tied largest groups all win. If every choice is unique, nobody wins. This creates a quick social compatibility game without moderator or subjective scoring.

Content is data-driven through stable bilingual `SameWavePrompt` records. A rematch keeps participants and selects a different prompt when possible.

## Statistics screen

`#stats` is a separate application screen, reachable from catalog and game setup when no session is active. It shows:

- catalog-wide games played, wins, losses, and win rate;
- one card per saved player with overall totals;
- per-game played/won/lost values for Impostore, Bomba, and Stessa Onda;
- Impostore role split for migrated and newly recorded results;
- empty states for new profiles and an entirely empty roster.

Each completed session records once using `scoreRecorded`. Abandoned sessions never affect statistics. Statistics remain editable through player editing only if all invariants hold: non-negative safe integers and wins plus losses equals games played for every game.

## Compatibility and non-goals

- Existing IndexedDB snapshots migrate in memory: current counters become Impostore statistics, current settings become Impostore settings, and current active games receive `gameId: "impostor"`.
- Physical database name, store, and key stay unchanged to preserve installed data despite new brand.
- GitHub Pages base path stays `/ImpostorGame/` until repository itself is renamed.
- No backend, multiplayer networking, cloud sync, speech recognition, answer validation, user accounts, ads, analytics, or install-time content download.
- Desktop and mobile browsers use same responsive UI; primary QA viewports remain 390 × 844 and 320 × 740.

