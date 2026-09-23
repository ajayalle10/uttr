/**
 * Uttr — shared default settings
 *
 * Loaded by BOTH the content script (see manifest.json) and the popup
 * (see popup/popup.html), so the defaults are defined in exactly one place.
 *
 * These are also the values used the very first time the extension runs,
 * before the user has changed anything.
 */
const DEFAULT_SETTINGS = Object.freeze({
  enabled: true, // auto-read on selection
  rate: 1.0, // speech speed: 0.5 (slow) to 2 (fast)
  voiceURI: "", // "" means "use the system default voice"
});
