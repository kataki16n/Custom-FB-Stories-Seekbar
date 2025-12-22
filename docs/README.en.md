# Custom Seekbar for Facebook Stories

Adds a **draggable seekbar** and **time display** to Facebook Stories.

> This repository supports **2 installation methods**:
>
> 1) **Tampermonkey userscript** (recommended)
> 2) **Chrome Extension** (for users who don’t use Tampermonkey)

## Quick Install (Tampermonkey)

1. Install Tampermonkey:
   - Chrome: https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - Edge: https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd
2. One-click install (Tampermonkey will detect it and prompt you to install):
   - https://raw.githubusercontent.com/DuckCIT/custom-fb-story-seekbar/main/userscript/custom_fb_stories_seekbar.user.js
3. Refresh Facebook and open any story: `https://www.facebook.com/stories/...`

## Option 2: Chrome Extension

1. Download this repo (ZIP) or `git clone` it.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the `extension/` folder (where `manifest.json` is located).

## Preview

### Before
<p align="center"><img src="./assets/before.png" width="400"/></p>

### After
<p align="center"><img src="./assets/after.png" width="400"/></p>

## FAQ

### Why does seeking sometimes not work?

Facebook is a SPA and may render multiple `<video>` elements at the same time (hidden/preview/old). If the script binds to the wrong `<video>`, time may look correct but seeking won’t affect the currently visible story.

### Can this break?

Yes. The script currently relies on Facebook’s CSS class names for locating the progress container. If Facebook changes its UI/classes, the selector may need updates.
