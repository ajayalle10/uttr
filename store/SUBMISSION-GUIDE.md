# How to publish Uttr to the free extension stores

All three stores are **free** to join. Each needs its own account, and you'll submit in each one separately.

**Before you start, download these two files** from the [latest GitHub release](https://github.com/ajayalle10/uttr/releases/latest):
- `uttr.zip`: for **Edge** and **Opera** (and Chrome later)
- `uttr-firefox.zip`: for **Firefox** only

Keep [`LISTING.md`](LISTING.md) open in another tab. Every text field below is copied from there. The images are in this [`store/`](.) folder.

> ℹ️ Store websites change their layouts from time to time, so a button may be worded slightly differently from what's written here. The steps stay the same.

---

## 1. Microsoft Edge Add-ons 🟦

**Time:** about 20 minutes. **Review:** up to about 7 business days.

### A. Create your free developer account (one time)
1. Go to **https://partner.microsoft.com/dashboard/microsoftedge/overview**
2. Sign in with a Microsoft account (Outlook/Hotmail/Xbox), or create one.
3. Choose **Register** for the Microsoft Edge program. It's **free**.
4. Fill in your details: account type **Individual**, then your name, email and country. Accept the agreement.

### B. Submit Uttr
1. In the Edge dashboard, click **Create new extension**.
2. **Upload** `uttr.zip`. Edge reads the name, version and icon from it.
3. **Availability:** set **Visibility** to **Public** and **Markets** to all markets.
4. **Properties:**
   - Category: **Accessibility**
   - Privacy policy: **Yes**, and paste the privacy policy URL from `LISTING.md`
   - Website URL and support contact: from `LISTING.md`
   - Mature content: **No**
5. **Store listings** (English):
   - Description: paste the **Full description**
   - Short description: paste the **Short description**
   - Extension logo: upload `logo-300x300.png`
   - Small promotional tile: upload `promo-tile-440x280.png`
   - Screenshots: upload both `screenshot-*.png` files
   - Search terms: paste from `LISTING.md`
6. **Submit**, and paste the **Notes for reviewers** text when asked.

When it's approved, Microsoft emails you. Your store link will look like:
`https://microsoftedge.microsoft.com/addons/detail/uttr/<an-id>`

---

## 2. Firefox Add-ons (addons.mozilla.org) 🦊

**Time:** about 15 minutes. **Review:** automatic checks run in minutes, and it's often listed within hours to a few days.

### A. Create your free account (one time)
1. Go to **https://addons.mozilla.org/developers/**
2. Click **Log in**, then create a **Mozilla account** with your email, or sign in.
3. The first time, you'll be asked to accept the **Firefox Add-on Distribution Agreement**.

### B. Submit Uttr
1. Click **Submit a New Add-on**.
2. Choose where to host it: **On this site** (so it's listed publicly).
3. **Upload** `uttr-firefox.zip`. ⚠️ Use the **Firefox** ZIP, not `uttr.zip`.
   - Compatible platforms: tick **Firefox**. Leave **Firefox for Android** unticked for now, since it hasn't been tested on phones yet.
4. **"Do you need to submit source code?"**: answer **No**. Uttr's code isn't minified or bundled.
5. **Describe your add-on:**
   - Name: `Uttr`
   - Add-on URL: `uttr`, which gives you `addons.mozilla.org/firefox/addon/uttr`. If it's taken, try `uttr-reader`.
   - Summary: paste the **Short description**
   - Description: paste the **Full description**
   - Category: **Language Support** (or **Other**)
   - Support email/website: the Support URL from `LISTING.md`
   - **License:** choose **All Rights Reserved**, unless you've added an open-source licence such as MIT to the repo. Then pick that one.
   - Privacy policy: tick "This add-on has a privacy policy" and paste the text of `PRIVACY.md`.
   - Notes to reviewer: paste the **Notes for reviewers**.
6. **Submit Version**.
7. Afterwards, on the add-on's **Edit Product Page**, upload `icon128.png` as the icon and add both screenshots.

Your store link will be:
`https://addons.mozilla.org/firefox/addon/uttr/`

---

## 3. Opera Add-ons 🟥

**Time:** about 15 minutes. **Review:** can be slow, sometimes a few weeks.

### A. Create your free account (one time)
1. Go to **https://addons.opera.com/developer/**
2. Sign in, or create an **Opera account**.
3. Accept the developer terms when asked.

### B. Submit Uttr
1. Click **Upload package** and choose `uttr.zip`.
2. Fill in the listing:
   - Category: **Accessibility**
   - Summary and Description: from `LISTING.md`
   - Icon: `icon128.png` (Opera may ask for 64×64 as well; it usually resizes it)
   - Screenshots: both `screenshot-*.png` files. If Opera asks for a specific size such as 612×408, tell Claude and new sizes can be made.
   - Homepage and support: from `LISTING.md`
   - Privacy policy URL: from `LISTING.md`
3. Click **Submit for moderation**.

Your store link will look like:
`https://addons.opera.com/extensions/details/uttr/`

---

## After approval ✅

1. **Try your own listing**: install Uttr from each store on your own computer.
2. **Send the store links to Claude** so "Get it on Edge / Firefox / Opera" buttons can be added to the README.
3. **Share them!** Store links are one-click installs, much easier than the ZIP method.

## Releasing updates later

1. Make the changes and bump `"version"` in `manifest.json`, for example `0.1.2` → `0.2.0`.
2. Run `python scripts/build.py` to create fresh `dist/uttr.zip` and `dist/uttr-firefox.zip`.
3. Upload to each store:
   - **Edge:** open Uttr, go to **Packages**, **Replace**, then **Publish**
   - **Firefox:** open Uttr, go to **Upload New Version**
   - **Opera:** open Uttr, go to **Upload new version**
4. Updates are **free**. Users receive them automatically after review.

## If a review is rejected

The store emails you the reason. Common ones, and what to do:
- **"Broad host permissions"**: reply with the permission justification from `LISTING.md`. Uttr needs to work on every site because you can select text anywhere.
- **"Missing privacy policy"**: make sure the privacy policy URL or text was added.
- Anything else: paste the message to Claude and we'll fix it together.
