# IndexedDB persistence

## Physical database

| Element | Value |
| --- | --- |
| Database name | `impostor-game` (legacy technical identifier retained for data compatibility) |
| Version | `1` |
| Object store | `snapshot` |
| Snapshot key | `current` |
| Operations | `get("current")` for reads, `put(data, "current")` for writes, `delete("current")` for invalid snapshots |

The database is opened only in the browser. During `onupgradeneeded`, `snapshot` is created if it does not exist; each transaction closes the connection when it finishes. Open, blocked, read, and write errors are propagated to the interface. If a write cannot be cloned, the transaction is aborted to preserve the previous snapshot.

## Target logical model

```mermaid
classDiagram
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
    +ImpostorRoleStats impostorRoles
  }
  class GameStats {
    +number gamesPlayed
    +number wins
    +number losses
  }
  class ActiveGame {
    <<union>>
    +string id
    +GameId gameId
    +Player[] players
    +boolean scoreRecorded
  }
  class ImpostorGame {
    +string[] impostorIds
    +WordEntry entry
    +string phase
    +number revealIndex
    +string[] accusedIds
    +string[] eliminatedIds
    +string[] foundImpostorIds
    +string starterId
    +number attemptsUsed
    +number maxAttempts
  }
  class BombGame {
    +BombPrompt prompt
    +string phase
    +number currentPlayerIndex
    +number answerCount
    +number deadline
    +string loserId
  }
  class SameWaveGame {
    +SameWavePrompt prompt
    +string phase
    +number revealIndex
    +Record selections
    +string[] winnerIds
  }
  class WordEntry {
    +string word
    +string hint
    +string wordEn
    +string hintEn
    +SelectableCategoryId category
  }
  AppData "1" o-- "0..*" Player : reusable profiles
  Player "1" *-- "1" PlayerStats : stats
  PlayerStats "1" *-- "3" GameStats : per game
  AppData "1" o-- "0..1" ActiveGame : activeGame
  ActiveGame <|-- ImpostorGame
  ActiveGame <|-- BombGame
  ActiveGame <|-- SameWaveGame
  ActiveGame "1" o-- "2..20" Player : participants
  ImpostorGame "1" *-- "1" WordEntry : entry
```

`AppData` is the complete snapshot written under `current`. `activeGame` may be `null`; its `gameId` selects one union member and allows exact resume after reload. Every session carries `scoreRecorded`, preventing duplicate updates after re-renders or reloads. Bomb uses an absolute deadline so elapsed time survives reload without persisting a timer handle. Player totals are derived from per-game records. Impostore retains its role breakdown. Locale and transient reveal flags remain outside individual game records.

`loadData()` validates and migrates snapshots at the boundary. Legacy counters become Impostore statistics; legacy settings become `settings.impostor`; legacy active games gain `gameId: "impostor"`; selected game defaults to Impostore. New writes use only target shape. Malformed or unsupported snapshots are deleted and treated as absent. No IndexedDB version bump is needed because compatibility normalization operates on single stored snapshot value.

## Data scope

The data is local-only: it stays in the page origin's IndexedDB and is not synchronized with a server or remote database. Clearing site data deletes saved players, settings, and the active game. Availability depends on the browser's IndexedDB support and permissions.
