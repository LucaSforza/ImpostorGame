# Launch materials

These are ready-to-adapt launch drafts for Pocket Circle. The app is free, local-first, and released under AGPL-3.0-or-later. No post has been published from these drafts.

## Before sharing

- The public game URL is <https://lucasforza.github.io/ImpostorGame/> and the source is <https://github.com/lucasforza/ImpostorGame>.
- Use only current screenshots or a real capture of the current build. Do not include personal profiles, uploaded photos, or other private browser data.
- Be transparent that you made the project and AI tools assisted development. Do not infer the provenance of every existing asset. See [provenance notes](../docs/naming-and-provenance.md).
- Review a community's current posting rules, required flair, and link policy before using a Reddit draft. Rules change, and some pages may be unreadable when logged out. Do not frame a promotion as a feedback request unless you have a real, specific question and the community allows that format.
- Do not invent player counts, reviews, testimonials, or performance claims.

## Files

- [Reddit post drafts](reddit.md)
- [itch.io page and publishing checklist](itch-io.md)
- [Product Hunt listing draft](product-hunt.md)
- [Short video shot list](video.md)
- [Repository presentation suggestions](repository-presentation.md)
- [Release notes](release-notes.md)
- [Hacker News draft](hacker-news.md)
- [Feedback replies](feedback-response.md)
- [Real screenshots](screenshots/)
- [Social preview](social-preview.png)

These drafts do not establish current permission to post. The individual community rules pages are linked inline in the Reddit drafts. Reddit sometimes redirects these pages to a login or moderator view, so verify the visible rules in the account you will post from immediately before posting. The drafts are deliberately written as direct, disclosed promotion; adapt or skip them if the community does not currently allow that post type.

## Media provenance and reproduction

Screenshots come from the production preview using Playwright, fictional QA Ada/Bea/Cy profiles and existing preset avatars. `screenshots/capture.json` records the run. No private browser data or fabricated UI was used. `social-preview.png` is a 1200×630 composition of those captures and the existing vector brand; its deployed copy is `public/social-preview.png`.

After building and starting `npm run preview`:

```sh
QA_MEDIA=1 npm run qa:launch
node scripts/generate-social-preview.mjs
node scripts/generate-icons.mjs
node scripts/record-launch.mjs
```

Playwright Chromium must be installed. Generated screenshots/social media are committed; local recording files and distribution ZIPs are generated artifacts. See the video draft for caption/edit guidance. Review [asset provenance limits](../docs/naming-and-provenance.md) before making ownership claims.
