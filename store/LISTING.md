# Uttr: store listing text

Copy and paste these into each store's submission form. The same text works for Edge, Firefox, Opera and, later, Chrome.

---

## Name
```
Uttr
```

## Short description / summary
_(Chrome allows 132 characters, Firefox 250 and Edge 250. This one is 114.)_
```
Select text on any webpage and hear it read aloud. Choose your voice and speed. Private: no accounts, no tracking.
```

## Full description
```
Uttr reads text aloud the moment you select it. There's no button to press and no copy-pasting: highlight a sentence, a paragraph or a whole article, and hear it.

HOW IT WORKS
• Select text on any website with your mouse, and Uttr reads it aloud
• Select something else and it switches instantly
• Press Esc, or click Stop in the Uttr menu, to stop anytime

MAKE IT YOURS
• Choose from every voice installed on your computer
• Adjust the speed from 0.5× (slow) to 2× (fast)
• Turn auto-read on or off with one click
• Your settings are remembered

BUILT FOR LONG READS
Uttr splits long text into natural, sentence-sized pieces, so articles are read smoothly to the end without cutting off.

PRIVATE BY DESIGN
• No account needed
• No tracking, analytics or ads
• Uttr collects no data. Selected text goes straight to your browser's built-in speech engine and is never stored or sent anywhere by Uttr.

GREAT FOR
• Giving your eyes a break from screens
• Staying focused on long articles
• Learning pronunciation in a new language
• Anyone who finds listening easier than reading

Uttr is free and open source: https://github.com/ajayalle10/uttr
Made by Ajay Alle.
```

## Category (suggested)
| Store | Category |
|---|---|
| Microsoft Edge | Accessibility |
| Firefox | Language Support (or Other) |
| Opera | Accessibility |
| Chrome (later) | Accessibility |

## Search terms / tags
_(Edge allows up to 7 search terms.)_
```
text to speech, read aloud, tts, speech, accessibility, dyslexia, reader
```

## Links
| Field | Value |
|---|---|
| Website / homepage | `https://github.com/ajayalle10/uttr` |
| Support URL | `https://github.com/ajayalle10/uttr/issues` |
| Privacy policy URL | `https://github.com/ajayalle10/uttr/blob/main/PRIVACY.md` |

## Permission justifications
Stores may ask why each permission is needed:

**storage**
```
Saves the user's three settings (auto-read on/off, speech speed and chosen voice) so they persist between browser sessions.
```

**Access to all websites (content script on <all_urls>)**
```
Uttr's single purpose is to read aloud text the user selects on any webpage. The content script listens for the user's text selection and passes the selected text to the browser's built-in speech engine. It doesn't read, collect or transmit page content otherwise.
```

**Single purpose** _(if asked)_
```
Read aloud the text the user selects on a webpage.
```

## Data collection / privacy questions
Answer **"No / does not collect"** to every data-collection question. Uttr collects no personal data, no website content, no browsing history and no analytics.

## Notes for reviewers
```
No account or login is needed. To test: open any article (for example a news page), select a sentence with the mouse, and it will be read aloud. Press Esc to stop. Click the toolbar icon to change speed and voice or to turn auto-read off.
```

## Images (in this folder)
| File | Size | Use for |
|---|---|---|
| `logo-300x300.png` | 300×300 | Store logo / icon (Edge asks for 300×300) |
| `../icons/icon128.png` | 128×128 | Store icon (Firefox, Opera, Chrome) |
| `screenshot-1-select-to-hear.png` | 1280×800 | Screenshot 1 |
| `screenshot-2-settings.png` | 1280×800 | Screenshot 2 |
| `promo-tile-440x280.png` | 440×280 | Small promotional tile (Edge, Chrome) |
