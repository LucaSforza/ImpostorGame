# Hacker News draft

Review current [Show HN guidance](https://news.ycombinator.com/showhn.html) and [site guidelines](https://news.ycombinator.com/newsguidelines.html) before posting. Use one direct launch post; do not coordinate votes or post automatically.

**Title:** Show HN: Pocket Circle – four free party games on one shared phone

**URL:** https://lucasforza.github.io/ImpostorGame/

**Maker comment:**

I built Pocket Circle because casual party games kept putting ads, locked categories and subscriptions between friends and a quick round.

It includes Impostore (hidden-word bluffing), Bomba (topic answers against a hidden timer), Chi sono? (yes/no identity guessing), and Twit (numerical estimates plus predictions). English and Italian, 2–20 players depending on the game, one shared phone.

The constraints are deliberate: static TypeScript/Vite, no account, backend or analytics, and IndexedDB saves. Private reveals close when the page loses visibility. The PWA caches the complete application after an online visit; updates wait for existing tabs to close instead of interrupting an active game. Hash links work with GitHub Pages and never replace an active session.

Source: https://github.com/LucaSforza/ImpostorGame (AGPL-3.0-or-later). Development used AI assistance; source, reproducible checks and known provenance limits are documented. I welcome concrete feedback on accessibility, offline behavior and local-data compatibility.
