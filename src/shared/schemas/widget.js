import { z } from 'zod';
import {
  WIDGET_ATTENTION_ANIMATIONS,
  WIDGET_DELAYS,
  WIDGET_MOBILE_BEHAVIORS,
  WIDGET_POSITIONS,
  WIDGET_THEMES,
  WIDGET_WIDTH,
} from '../constants/index.js';
import { httpUrl, objectId, optional } from './common.js';

export const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-f]{6}$/i, 'Use a hex color like #6d5dfc');

export const widgetFieldsShape = {
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be 80 characters or fewer'),
  position: z.enum(WIDGET_POSITIONS),
  delay: z.coerce
    .number()
    .refine((v) => WIDGET_DELAYS.includes(v), `Delay must be one of ${WIDGET_DELAYS.join(', ')} seconds`),
  autoplay: z.boolean(),
  muted: z.boolean(),
  showCaptions: z.boolean(),
  showLiveIndicator: z.boolean(),
  primaryCtaText: optional(z.string().trim().max(40, 'CTA text must be 40 characters or fewer')),
  primaryCtaUrl: optional(httpUrl),
  theme: z.enum(WIDGET_THEMES),
  accentColor: hexColor,
  width: z.coerce.number().int().min(WIDGET_WIDTH.MIN).max(WIDGET_WIDTH.MAX),
  mobileBehavior: z.enum(WIDGET_MOBILE_BEHAVIORS),
  attentionAnimation: z.enum(WIDGET_ATTENTION_ANIMATIONS),
  enabled: z.boolean(),
};

const partialFields = z.object(widgetFieldsShape).partial();

/** POST /api/widgets — everything except the video is optional (model defaults apply). */
export const createWidgetSchema = partialFields.extend({ videoId: objectId });

/** PATCH /api/widgets/:id */
export const updateWidgetSchema = partialFields.extend({ videoId: objectId.optional() });

/** Complete widget settings form used by the dashboard editor. */
export const widgetFormSchema = z.object({ videoId: objectId, ...widgetFieldsShape }).superRefine((value, ctx) => {
  if (value.primaryCtaText && !value.primaryCtaUrl) {
    ctx.addIssue({ code: 'custom', path: ['primaryCtaUrl'], message: 'Add a URL for your call to action.' });
  }
  if (value.primaryCtaUrl && !value.primaryCtaText) {
    ctx.addIssue({ code: 'custom', path: ['primaryCtaText'], message: 'Add button text for your call to action.' });
  }
});

export const publicWidgetIdParams = z.object({
  publicId: z.string().regex(/^wgt_[A-Za-z0-9]{12,40}$/, 'Invalid widget id'),
});
