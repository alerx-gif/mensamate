# mensa-mate

## 1.7.0

### Changes

- Redesigned the weekly menu view around a day selector, replacing the side-by-side day columns that forced scrolling in two directions at once.
- The day heading now stays pinned while scrolling the weekly menu, so the day you are looking at is always visible.
- Rebuilt the Settings panel: every section is visible at once instead of behind collapsing accordions, with a labelled Light/Dark/System control and allergens as selectable chips.
- Settings now closes with Escape, keeps keyboard focus inside the dialog, and stops the page behind it from scrolling.
- Removed Sync Codes and cross-device syncing. Settings are now stored on this device only.
- Removed the Protein and Balanced highlight filters.
- Replaced the maths captcha behind the feedback button with a hosted feedback form.
- Added Impressum and Privacy Policy pages with language support.
- Rewrote the privacy policy to follow the Swiss Data Protection Act (FADP/DSG): it now describes exactly what the app stores (settings stay on your device), covers Vercel Web Analytics and the wsrv.nl image service, explains transfers abroad, and lists your rights and how to contact the FDPIC.
- Added iOS launch screens, so the installed app no longer opens on a black screen.
- Menu images are now served as WebP at the size actually needed, cutting image traffic by around 70%.
- Opening a meal no longer downloads its photo again: the detail view reuses the image the card already loaded.
- Dialogs are now loaded only when they are opened, cutting the JavaScript needed to start the app by roughly a fifth.
- Menu text now appears immediately instead of slowly fading in.

### Fixes

- Fixed Obere Mensa UZH showing no menus, UZH restaurants appearing empty on Monday mornings, and "CHF 0.00" prices in the UZH weekly view.
- Fixed dinner menus being mixed into lunch on the weekly view.
- Fixed unreadable opening hours in dark mode.
- Fixed the same menu data being requested twice from the ETH API on every page load.
- Fixed the weekly menu using UTC rather than Swiss time, which could show the wrong day late in the evening.
- Fixed dark mode on the weekly menu page, where the restaurant name was rendered in near-black on a near-black background.
- Fixed the weekly menu loading placeholder, which referenced colours that do not exist and so rendered invisible.
- Fixed the appearance buttons in Settings stacking vertically, and colours throughout Settings that ignored dark mode.
- Fixed the iOS home screen icon showing a letter instead of the Mensa Mate icon.
- Fixed blur from the top bar bleeding into the title and buttons on iOS 26, and moved the bar clear of the status bar in the installed app.
- Fixed the missing top bar blur in Chrome and on Android.

## 1.6.0

### Minor Changes

- Added ETH Student Card (Legi) integration for quick access.
- Added new Protein and Balanced highlight filters to instantly find top macro picks.
- Implemented instantaneous client-side navigation for zero-delay restaurant switching.
- Significantly improved app performance by introducing aggressive caching for UZH and ETH APIs.
- Fixed an issue causing UZH meal images to crash the app.
- Corrected nutrition labels to dynamically show 'per serving' for UZH and 'per 100g' for ETH.
- Redesigned empty states across the app with fun icons and a cleaner look.
- Refined Menu Detail Modal UI and improved scroll behavior on iOS.
- Fixed iOS home screen icon resolution in production.
- Cleaned up dead code and improved internal architecture.
- Grouped lunch and dinner menus based on time of day, with secondary menus hidden behind a toggle.
- Replaced '0' with a clear 'unavailable' message for items missing nutritional data.
- Hid scrollbars in the item detail modal for a cleaner look.
- Grouped and sorted 'Favorite Mensa' settings locations (Zentrum, Hönggerberg, UZH, Other).
- Fixed a bug on mobile where the top navbar overlapped the item detail view.
- Updated the weekly menu button style and added an arrow indicator.
## 1.5.0

### Major Changes

- Initial setup of Changesets for versioning and GitHub Action for automated releases.
  Added version display and disclaimer to the footer.
