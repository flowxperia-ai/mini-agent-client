import { SCRIPT_LIMITS } from '../constants/index.js';

/** Count spoken words in a script. */
export function countWords(text = '') {
  const trimmed = String(text).trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).length;
}

/**
 * Estimate spoken duration in seconds.
 * Sentence-ending punctuation adds a short pause so estimates track real TTS pacing more closely.
 */
export function estimateDurationSeconds(text = '', wordsPerMinute = SCRIPT_LIMITS.WORDS_PER_MINUTE) {
  const words = countWords(text);
  if (words === 0) return 0;
  const pauses = (String(text).match(/[.!?]+(\s|$)/gu) || []).length;
  const seconds = (words / wordsPerMinute) * 60 + pauses * 0.3;
  return Math.max(1, Math.round(seconds));
}

/**
 * Split a script into caption-sized chunks (≈ up to `maxWords` words, breaking on punctuation first).
 * Used to build captions when the video provider does not return a subtitle file.
 */
export function splitIntoCaptionChunks(text = '', maxWords = 9) {
  const sentences = String(text)
    .replace(/\s+/gu, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/u)
    .filter(Boolean);

  const chunks = [];
  for (const sentence of sentences) {
    const words = sentence.split(' ');
    if (words.length <= maxWords) {
      chunks.push(sentence);
      continue;
    }
    // Break long sentences on commas where possible, then hard-wrap.
    const parts = sentence.split(/(?<=[,;:])\s+/u);
    let buffer = [];
    for (const part of parts) {
      const partWords = part.split(' ');
      if (buffer.length + partWords.length > maxWords && buffer.length) {
        chunks.push(buffer.join(' '));
        buffer = [];
      }
      for (const word of partWords) {
        buffer.push(word);
        if (buffer.length >= maxWords) {
          chunks.push(buffer.join(' '));
          buffer = [];
        }
      }
    }
    if (buffer.length) chunks.push(buffer.join(' '));
  }
  return chunks;
}

/**
 * Build caption cues distributed across `durationSeconds` proportionally to word count.
 * @returns {{ start: number, end: number, text: string }[]}
 */
export function buildProportionalCaptions(text, durationSeconds) {
  const chunks = splitIntoCaptionChunks(text);
  const totalWords = chunks.reduce((sum, c) => sum + countWords(c), 0);
  if (!totalWords || !durationSeconds) return [];

  const cues = [];
  let cursor = 0;
  for (const chunk of chunks) {
    const share = (countWords(chunk) / totalWords) * durationSeconds;
    const start = cursor;
    const end = Math.min(durationSeconds, cursor + share);
    cues.push({ start: round2(start), end: round2(end), text: chunk });
    cursor = end;
  }
  return cues;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
