import { z } from 'zod';
import { GESTURES, SCRIPT_LIMITS } from '../constants/index.js';
import { estimateDurationSeconds } from '../utils/script.js';
import { httpUrl, objectId, optional } from './common.js';

/**
 * Normalise limit overrides. Server passes env-derived values; the client passes values from /api/config.
 */
export function resolveScriptLimits(limits = {}) {
  return {
    maxChars: limits.maxChars ?? SCRIPT_LIMITS.MAX_CHARS,
    wordsPerMinute: limits.wordsPerMinute ?? SCRIPT_LIMITS.WORDS_PER_MINUTE,
    minSeconds: limits.minSeconds ?? SCRIPT_LIMITS.MIN_SECONDS,
    maxSeconds: limits.maxSeconds ?? SCRIPT_LIMITS.MAX_SECONDS,
  };
}

/** Field shape for a script + optional call-to-action. */
export function scriptShape(limits) {
  const l = resolveScriptLimits(limits);
  return {
    script: z
      .string({ error: 'Script is required' })
      .trim()
      .min(1, 'Script is required')
      .max(l.maxChars, `Script must be ${l.maxChars} characters or fewer`),
    ctaText: optional(z.string().trim().max(40, 'CTA text must be 40 characters or fewer')),
    ctaUrl: optional(httpUrl),
  };
}

/** Cross-field rules: reasonable duration. CTA text and URL are independent — neither requires the other. */
export function refineScript(limits) {
  const l = resolveScriptLimits(limits);
  return (value, ctx) => {
    if (value.script) {
      const seconds = estimateDurationSeconds(value.script, l.wordsPerMinute);
      if (seconds < l.minSeconds) {
        ctx.addIssue({
          code: 'custom',
          path: ['script'],
          message: `Script is too short — aim for at least ${l.minSeconds} seconds of speech.`,
        });
      }
      if (seconds > l.maxSeconds) {
        ctx.addIssue({
          code: 'custom',
          path: ['script'],
          message: `Script is too long — estimated ${seconds}s, maximum is ${l.maxSeconds}s.`,
        });
      }
    }
  };
}

export function createScriptSchema(limits) {
  return z.object(scriptShape(limits)).superRefine(refineScript(limits));
}

/** Body for POST /api/videos/generate. */
export function createGenerateVideoSchema(limits) {
  return z
    .object({
      avatarId: objectId,
      title: optional(z.string().trim().max(100, 'Title must be 100 characters or fewer')),
      gesture: z.enum(GESTURES).default('none'),
      // Starter only — picks a pricier, more expressive HeyGen engine for this video. Ignored
      // (silently treated as 'normal') for plans that don't define an expressive tier.
      avatarStyle: z.enum(['normal', 'expressive']).default('normal'),
      ...scriptShape(limits),
    })
    .superRefine(refineScript(limits));
}
