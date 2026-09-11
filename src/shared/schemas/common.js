import { z } from 'zod';

/** Treat blank strings / null (common from HTML forms) as "not provided". */
export const blankToUndefined = (value) =>
  value === null || (typeof value === 'string' && value.trim() === '') ? undefined : value;

/** Wrap a schema so blank form values become `undefined`. */
export const optional = (schema) => z.preprocess(blankToUndefined, schema.optional());

export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}

/** http(s) URLs only — rejects javascript:, data:, etc. */
export const httpUrl = z
  .string()
  .trim()
  .max(2048, 'URL is too long')
  .refine(isHttpUrl, 'Enter a valid URL starting with http:// or https://');

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParams = z.object({ id: objectId });
