# itch.io page draft

## Page setup

- **Title:** Pocket Circle
- **Short description:** Four pass-and-play party games for one shared phone. Free, open source, and private by design.
- **Kind:** HTML
- **Classification:** Games → Other (or the closest available tabletop/party category)
- **Pricing:** No payments. The game is free, and the page should not require a donation.
- **Upload:** Build the browser package with `npm run package:itch`; upload `dist-itch.zip` as the HTML game. Confirm the ZIP contains a root `index.html` and all asset paths are relative before publishing.
- **Embed:** Click to launch in fullscreen. Enable Click to Play. Mark Mobile Friendly only after checking the uploaded build on phones; itch.io launches HTML games fullscreen on mobile.
- **Display:** Responsive; do not lock to portrait or landscape. The app supports narrow portrait layouts from 320 px.
- **Source/license:** Link the source repository and AGPL-3.0-or-later license in the page description. Make source available from the project page, for example with a source-code download or a clear link to the repository.
- **Screenshots:** Use the current catalog and one screen per game. Suggested cover art ratio is 315:250 (630×500 or larger at that ratio); keep essential copy out of the image.

The uploaded package does not include the service worker. A browser embedded on itch.io has its own origin and local save data, separate from the GitHub Pages version.

## Page description

Pass one phone around and play four quick party games together. Bluff over a hidden word, race a secret timer, guess your identity, or predict who will miss a number by the most.

**Four games, one phone**

- **Impostore:** share a secret word, bluff, talk, and vote for the impostors (3–20 players).
- **Bomba:** say topic-related answers until a hidden 45–120 second deadline, then let the group decide who was caught (2–20 players).
- **Chi sono?:** ask yes-or-no questions, then take one guess at your hidden identity (3–20 players).
- **Twit:** estimate a number and predict the farthest guess; closest earns 2 points and each correct prediction earns 1 (3–20 players, 1/3/5/10 rounds).

No sign-up, ads, or tracking. Profiles, active rounds, and scores stay in this browser. After the first visit and cache setup, the GitHub Pages version can run offline while its browser cache remains available. This itch.io embed is a separate build with separate browser storage.

Pocket Circle is free software under [AGPL-3.0-or-later](https://github.com/lucasforza/ImpostorGame/blob/main/LICENSE). [Source code](https://github.com/lucasforza/ImpostorGame).

## Publishing checklist

1. From a clean committed checkout run `npm ci && npm run package:itch`. Inspect `dist-itch.zip`: root `index.html`, all bundled assets, no absolute `/assets/...` references, and no service-worker files.
2. Create a new itch.io project and select **HTML**. Set the page to **No payments**.
3. Upload the ZIP, select **Click to launch in fullscreen**, and keep **Click to Play** enabled.
4. Check the page preview and game launch on desktop. Test the uploaded embed on at least one phone before enabling **Mobile Friendly**.
5. Confirm all game flows work, including returning from a refresh, within the embed origin. Existing data on the main site does not transfer.
6. Add screenshots, the source link, and the license link. Save as a draft until the page content and embed have been checked.

These settings follow itch.io's [HTML5 upload guide](https://itch.io/docs/creators/html5), [first-page guide](https://itch.io/docs/creators/getting-started), and [pricing guide](https://itch.io/docs/creators/pricing). Recheck those pages before publishing in case the creator interface changes.

Recommended tags: `party-game`, `local-multiplayer`, `pass-and-play`, `casual`, `browser`, `open-source` (choose the closest tags actually available in the creator UI). Use the six real screenshots in `marketing/screenshots/`. The social preview is landscape artwork; do not relabel it as an unedited gameplay screenshot. Include the exact commit source link from bundled `SOURCE.md`. No archive is uploaded by these commands.
