/**
 * Uttr — content script
 *
 * Chrome injects this file into every webpage (see "content_scripts" in
 * manifest.json). It runs alongside the page's own JavaScript and can see
 * the page's DOM, which is how we read what the user has selected.
 *
 * Flow: mouseup -> wait 300ms -> check the selection -> split it into
 * chunks -> queue each chunk with speechSynthesis.
 *
 * DEFAULT_SETTINGS comes from defaults.js, which manifest.json loads first.
 */

// ---------------------------------------------------------------------------
// Tunable constants
// ---------------------------------------------------------------------------

// How long to wait after the mouse is released before reading.
// The pause gives double-clicks/triple-clicks time to finish expanding
// the selection, so we read the final selection, not a partial one.
const SELECTION_DELAY_MS = 300;

// Selections shorter than this are treated as accidental and ignored.
const MIN_SELECTION_LENGTH = 2;

// Longest piece of text we hand to the speech engine in one go, at 1x speed.
// Chrome (especially with its online "Google" voices) can silently stop
// speaking an utterance after ~15 seconds. 150 characters is roughly
// 10 seconds of speech at normal speed, which stays safely under that.
// At slower speeds the same text takes longer to say, so getMaxChunkLength()
// shrinks the limit to match.
const BASE_MAX_CHUNK_LENGTH = 150;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

// Current settings. Starts as the defaults, then gets replaced by the saved
// settings as soon as they load, and updated whenever the popup changes them.
let settings = { ...DEFAULT_SETTINGS };

// Holds the pending timer so a new mouseup can cancel the previous one.
let selectionTimer = null;

// The last text we started reading. Used to avoid re-reading the same
// selection when the user clicks somewhere that doesn't clear it.
let lastSpokenText = "";

// Splits text into sentences using the browser's built-in, language-aware
// rules. It's smarter than splitting on "." (it knows "e.g." or "Dr." are
// not sentence endings in many cases). Created once and reused.
const sentenceSegmenter = new Intl.Segmenter(undefined, { granularity: "sentence" });

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

// Load saved settings. Passing DEFAULT_SETTINGS means "for any setting that
// was never saved, use its default".
chrome.storage.sync.get(DEFAULT_SETTINGS).then((saved) => {
  settings = saved;
});

// Whenever the popup saves a setting, Chrome notifies every tab.
// `changes` looks like: { rate: { oldValue: 1, newValue: 1.5 } }
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;

  for (const [key, { newValue }] of Object.entries(changes)) {
    settings[key] = newValue;
  }

  // Turning auto-read off should also silence anything playing right now.
  if (changes.enabled && !changes.enabled.newValue) {
    stopSpeaking();
  }
});

// ---------------------------------------------------------------------------
// Text chunking
// ---------------------------------------------------------------------------

/**
 * The chunk size limit for the current speed. Slower speech means each
 * character takes longer to say, so we use smaller chunks.
 * e.g. 1x -> 150, 0.75x -> 113, 0.5x -> 75. Faster than 1x keeps 150.
 */
function getMaxChunkLength() {
  return Math.round(BASE_MAX_CHUNK_LENGTH * Math.min(settings.rate, 1));
}

/**
 * Turn any amount of text into a list of chunks, each at most `maxLength`
 * characters, split at natural boundaries where possible.
 *
 * Example: a 3-sentence paragraph -> ["Sentence one. Sentence two.", "Sentence three."]
 */
function splitIntoChunks(text, maxLength) {
  // Collapse runs of spaces/newlines/tabs into single spaces. Selected text
  // often contains line breaks from the page layout that we don't want.
  const cleanText = text.replace(/\s+/g, " ").trim();

  // 1. Split into sentences.
  const sentences = Array.from(sentenceSegmenter.segment(cleanText), (s) => s.segment.trim())
    .filter(Boolean);

  // 2. Break up any sentence that's still too long.
  const pieces = sentences.flatMap((sentence) => breakLongSentence(sentence, maxLength));

  // 3. Glue short pieces back together so we don't have a pause after
  //    every tiny sentence, while staying under the limit.
  return packPieces(pieces, maxLength);
}

/**
 * Break one over-long sentence into smaller pieces.
 * First tries clause boundaries (after , ; :), then falls back to words.
 */
function breakLongSentence(sentence, maxLength) {
  if (sentence.length <= maxLength) return [sentence];

  // "(?<=[,;:])\s+" means "whitespace that comes right after , ; or :".
  // The (?<=...) part is a lookbehind: the punctuation stays with its clause.
  const clauses = sentence.split(/(?<=[,;:])\s+/);

  return clauses.flatMap((clause) => {
    if (clause.length <= maxLength) return [clause];
    // Still too long: fall back to individual words (packPieces will
    // re-join them into chunks later).
    return clause.split(" ").flatMap((word) => hardSplitWord(word, maxLength));
  });
}

/**
 * Last resort for a single "word" longer than the limit (e.g. a huge URL):
 * cut it into fixed-size slices.
 */
function hardSplitWord(word, maxLength) {
  if (word.length <= maxLength) return [word];
  const slices = [];
  for (let i = 0; i < word.length; i += maxLength) {
    slices.push(word.slice(i, i + maxLength));
  }
  return slices;
}

/**
 * Greedily combine pieces into chunks no longer than `maxLength`.
 * Every piece is already guaranteed to fit on its own.
 */
function packPieces(pieces, maxLength) {
  const chunks = [];
  let current = "";

  for (const piece of pieces) {
    const candidate = current ? current + " " + piece : piece;
    if (candidate.length <= maxLength) {
      current = candidate;
    } else {
      chunks.push(current);
      current = piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// ---------------------------------------------------------------------------
// Speaking
// ---------------------------------------------------------------------------

/**
 * Find the voice the user picked in the popup, or null for the default.
 * Voices are looked up by voiceURI, their unique ID.
 */
function getSelectedVoice() {
  if (!settings.voiceURI) return null;
  return speechSynthesis.getVoices().find((v) => v.voiceURI === settings.voiceURI) ?? null;
}

/**
 * Read `text` aloud, interrupting anything already playing.
 */
function speak(text) {
  // Stop anything already playing so the new text starts immediately.
  speechSynthesis.cancel();

  const voice = getSelectedVoice();

  // speechSynthesis keeps its own queue: each speak() call adds an
  // utterance to the end, and they play one after another.
  for (const chunk of splitIntoChunks(text, getMaxChunkLength())) {
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.rate = settings.rate;
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang; // some voices only apply when lang matches
    }
    speechSynthesis.speak(utterance);
  }
}

/**
 * Stop any speech that is playing, and cancel a read that is waiting
 * on the 300ms timer so it doesn't start right after we stop.
 */
function stopSpeaking() {
  clearTimeout(selectionTimer);
  speechSynthesis.cancel();
}

// ---------------------------------------------------------------------------
// Selection handling
// ---------------------------------------------------------------------------

/**
 * Called shortly after the user releases the mouse.
 * Decides whether the current selection should be read, and reads it.
 */
function handleSelection() {
  const text = window.getSelection().toString().trim();

  // Ignore empty / whitespace-only selections (trim() made those "").
  // Ignore tiny selections, which are usually accidental.
  if (text.length < MIN_SELECTION_LENGTH) return;

  // Ignore a repeat of what we just read (e.g. the user clicked somewhere
  // that didn't clear the existing selection).
  if (text === lastSpokenText) return;

  lastSpokenText = text;
  speak(text);
}

// "mouseup" fires when the user releases the mouse button, which is the
// moment a drag-selection is finished.
document.addEventListener("mouseup", (event) => {
  // Auto-read switched off in the popup: do nothing.
  if (!settings.enabled) return;

  // Only react to the left mouse button. Right-clicking to open the
  // context menu (e.g. to copy) shouldn't trigger reading.
  if (event.button !== 0) return;

  clearTimeout(selectionTimer);
  selectionTimer = setTimeout(handleSelection, SELECTION_DELAY_MS);
});

// "selectionchange" fires whenever the selection changes in any way.
// When the selection is cleared (e.g. the user clicks elsewhere or starts a
// new drag), we forget the last text. That way, deliberately selecting the
// same text again will read it again: only an *unchanged* selection is skipped.
document.addEventListener("selectionchange", () => {
  if (window.getSelection().isCollapsed) {
    lastSpokenText = "";
  }
});

// Press Escape to stop reading.
// - The final `true` registers this in the "capture" phase, so we see the
//   key before the page's own scripts can swallow it.
// - We only act while speech is playing (or queued), so Escape keeps
//   working normally for the page otherwise (e.g. closing a dialog).
// - We don't call preventDefault(), so the page still receives Escape too.
document.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Escape") return;
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      stopSpeaking();
    } else {
      clearTimeout(selectionTimer); // Escape during the 300ms wait = never mind
    }
  },
  true
);

// ---------------------------------------------------------------------------
// Messages from the popup
// ---------------------------------------------------------------------------

// The popup's Stop button sends { type: "stop" } to this tab.
// We reply with sendResponse so the popup knows the message arrived.
// (If no content script is listening at all, e.g. on chrome:// pages, the
// popup's sendMessage fails and it shows a "can't run here" note instead.)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "stop") {
    stopSpeaking();
    sendResponse({ ok: true });
  }
});
