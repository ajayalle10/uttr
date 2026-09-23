/**
 * Uttr — popup logic
 *
 * Responsibilities:
 *  1. Load saved settings from chrome.storage.sync and show them.
 *  2. Save any change the user makes. The content script in every tab is
 *     listening for storage changes, so new settings apply instantly.
 *  3. Fill the voice dropdown with the voices installed on this computer.
 *  4. Tell the current tab to stop reading when "Stop" is clicked.
 *
 * DEFAULT_SETTINGS comes from ../defaults.js, loaded just before this file.
 */

const enabledInput = document.getElementById("enabled");
const rateInput = document.getElementById("rate");
const rateValue = document.getElementById("rateValue");
const voiceSelect = document.getElementById("voice");
const stopButton = document.getElementById("stop");
const statusText = document.getElementById("status");

// The saved voice, kept here because the voice list may load *after* the
// settings do (see populateVoices).
let savedVoiceURI = DEFAULT_SETTINGS.voiceURI;

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/**
 * Save a partial settings object, e.g. save({ rate: 1.5 }).
 * chrome.storage.sync stores data in the user's Chrome profile and syncs it
 * across their signed-in devices, so settings survive browser restarts.
 */
function save(partialSettings) {
  chrome.storage.sync.set(partialSettings);
}

function updateRateLabel() {
  rateValue.textContent = Number(rateInput.value).toFixed(1) + "×";
}

// ---------------------------------------------------------------------------
// Voices
// ---------------------------------------------------------------------------

/**
 * Fill the <select> with the available voices.
 *
 * Chrome loads the voice list asynchronously: getVoices() can return an
 * empty array at first, and the "voiceschanged" event fires once the list
 * is ready. So this function is called at startup AND on that event.
 */
function populateVoices() {
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return; // not loaded yet; we'll be called again

  // Sort by language, then name, so e.g. all English voices sit together.
  voices.sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name));

  // Keep the first "System default" option, replace everything after it.
  voiceSelect.length = 1;
  for (const voice of voices) {
    // voiceURI uniquely identifies a voice, so that's what we store.
    const option = new Option(`${voice.name} (${voice.lang})`, voice.voiceURI);
    voiceSelect.add(option);
  }

  // Re-select the saved voice. If it no longer exists (e.g. it was
  // uninstalled), fall back to "System default".
  const savedStillExists = voices.some((v) => v.voiceURI === savedVoiceURI);
  voiceSelect.value = savedStillExists ? savedVoiceURI : "";
}

// ---------------------------------------------------------------------------
// Stop button
// ---------------------------------------------------------------------------

/**
 * Ask the content script in the current tab to stop speaking.
 * The popup is a separate page from the website, so it can't touch the
 * tab's speech directly; it has to send a message.
 */
async function stopCurrentTab() {
  statusText.textContent = "";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "stop" });
  } catch {
    // No content script to receive the message. Happens on pages where
    // Chrome blocks extensions (chrome://, Web Store) or on tabs opened
    // before the extension was installed/reloaded.
    statusText.textContent = "Uttr isn't running on this page. Try refreshing it.";
  }
}

// ---------------------------------------------------------------------------
// Start-up and event wiring
// ---------------------------------------------------------------------------

async function init() {
  // Passing DEFAULT_SETTINGS means "give me these keys; if a key was never
  // saved, use the default value instead".
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  enabledInput.checked = settings.enabled;
  rateInput.value = settings.rate;
  updateRateLabel();
  savedVoiceURI = settings.voiceURI;

  populateVoices();
  speechSynthesis.addEventListener("voiceschanged", populateVoices);
}

enabledInput.addEventListener("change", () => {
  save({ enabled: enabledInput.checked });
});

// Two different events for the slider, on purpose:
// - "input" fires continuously while dragging -> just update the label.
// - "change" fires once when the user lets go -> save.
// chrome.storage.sync limits how many writes per minute are allowed, so
// saving on every tiny drag movement could hit that limit.
rateInput.addEventListener("input", updateRateLabel);
rateInput.addEventListener("change", () => {
  save({ rate: Number(rateInput.value) });
});

voiceSelect.addEventListener("change", () => {
  savedVoiceURI = voiceSelect.value;
  save({ voiceURI: voiceSelect.value });
});

stopButton.addEventListener("click", stopCurrentTab);

init();
