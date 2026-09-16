import { z } from 'zod';
import { CREDIT_TX_TYPE_LIST, OUTFIT_PROMPT_MAX_CHARS, PLAN_LIST, VIDEO_STATUS_LIST } from '../constants/index.js';
import { nameField, passwordField } from './auth.js';
import { paginationQuery } from './common.js';

export * from './common.js';
export * from './auth.js';
export * from './script.js';
export * from './widget.js';

/** PATCH /api/users/me */
export const updateMeSchema = z
  .object({
    name: nameField.optional(),
    plan: z.enum(PLAN_LIST).optional(),
    currentPassword: z.string().max(128).optional(),
    newPassword: passwordField.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword && !value.currentPassword) {
      ctx.addIssue({ code: 'custom', path: ['currentPassword'], message: 'Enter your current password.' });
    }
  });

/** POST /api/avatars/custom (multipart; file handled separately) */
export const createCustomAvatarSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name must be 60 characters or fewer'),
});

/** POST /api/avatars/photo (multipart; file handled separately) — same shape as the digital-twin form. */
export const createPhotoAvatarSchema = createCustomAvatarSchema;

/** POST /api/avatars/:id/looks — generate a new look (e.g. a different outfit) for an existing digital twin. */
export const generateAvatarLookSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name must be 60 characters or fewer'),
  outfit: z
    .string()
    .trim()
    .min(3, 'Describe the outfit in a bit more detail')
    .max(OUTFIT_PROMPT_MAX_CHARS, `Keep it under ${OUTFIT_PROMPT_MAX_CHARS} characters`),
});

/** POST /api/billing/checkout */
export const checkoutSchema = z.object({
  packageId: z.string().trim().min(1).max(64),
});

export const videoListQuery = paginationQuery.extend({
  status: z.enum(['all', 'processing', 'completed', 'failed']).default('all'),
});

export const ledgerQuery = paginationQuery.extend({
  type: z.enum(CREDIT_TX_TYPE_LIST).optional(),
});

/** POST /api/admin/users/:id/credits */
export const creditAdjustmentSchema = z.object({
  amount: z.coerce
    .number()
    .int('Amount must be a whole number')
    .min(-1_000_000)
    .max(1_000_000)
    .refine((v) => v !== 0, 'Amount cannot be zero'),
  reason: z.string().trim().min(3, 'Give a reason (min 3 characters)').max(200),
});

export const adminListQuery = paginationQuery.extend({
  q: z.string().trim().max(100).optional(),
  status: z.enum([...VIDEO_STATUS_LIST, 'all']).optional(),
});
