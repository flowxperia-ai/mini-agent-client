/**
 * Constants shared by the client and the server.
 *
 * Business values that are still open decisions (credit definition, engines,
 * package prices, …) are NOT defined here — they live in server configuration
 * and reach the client through GET /api/config.
 */

export const PLANS = Object.freeze({
  STARTER: 'STARTER',
  GROWTH: 'GROWTH',
});
export const PLAN_LIST = Object.values(PLANS);

export const USER_ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});

export const AVATAR_TYPES = Object.freeze({
  STOCK: 'STOCK',
  CUSTOM: 'CUSTOM',
});

/** Consent lifecycle for Growth (digital twin) avatars. */
export const CONSENT_STATUS = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
});
export const CONSENT_STATUS_LIST = Object.values(CONSENT_STATUS);

/** Provider-side training state of a custom avatar. */
export const TRAINING_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
});
export const TRAINING_STATUS_LIST = Object.values(TRAINING_STATUS);

export const VIDEO_STATUS = Object.freeze({
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
});
export const VIDEO_STATUS_LIST = Object.values(VIDEO_STATUS);
export const ACTIVE_VIDEO_STATUSES = Object.freeze([VIDEO_STATUS.QUEUED, VIDEO_STATUS.PROCESSING]);
export const TERMINAL_VIDEO_STATUSES = Object.freeze([
  VIDEO_STATUS.COMPLETED,
  VIDEO_STATUS.FAILED,
  VIDEO_STATUS.CANCELLED,
]);

export const CREDIT_TX_TYPES = Object.freeze({
  PURCHASE: 'PURCHASE',
  RESERVATION: 'RESERVATION',
  RELEASE: 'RELEASE',
  GENERATION: 'GENERATION',
  REFUND: 'REFUND',
  ADJUSTMENT: 'ADJUSTMENT',
});
export const CREDIT_TX_TYPE_LIST = Object.values(CREDIT_TX_TYPES);

export const CREDIT_REFERENCE_TYPES = Object.freeze({
  VIDEO_GENERATION: 'VideoGeneration',
  PAYMENT: 'Payment',
  ADMIN: 'Admin',
  SYSTEM: 'System',
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED',
});
export const PAYMENT_STATUS_LIST = Object.values(PAYMENT_STATUS);

/** What a checkout buys. Avatar slots are billed separately from generation credits. */
export const PRODUCT_KINDS = Object.freeze({
  CREDITS: 'CREDITS',
  AVATAR_SLOT: 'AVATAR_SLOT',
});

export const WEBHOOK_PROVIDERS = Object.freeze({
  HEYGEN: 'heygen',
  STRIPE: 'stripe',
  MOCK_PAYMENT: 'mock-payment',
});

export const WEBHOOK_EVENT_STATUS = Object.freeze({
  RECEIVED: 'RECEIVED',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED',
  IGNORED: 'IGNORED',
});

/**
 * Optional on-camera behaviour requested at generation time (Starter "wave / board / prop").
 * Sent to engines that support motion prompts; ignored by engines that do not.
 */
export const GESTURES = Object.freeze(['none', 'wave', 'board', 'prop', 'custom']);
export const GESTURE_LABELS = Object.freeze({
  none: 'Natural',
  wave: 'Friendly wave',
  board: 'Present to a board',
  prop: 'Show a product',
  custom: 'Custom motion',
});
export const CUSTOM_MOTION_PROMPT_MAX_CHARS = 300;
/** HeyGen's own limit for the `prompt` field when generating a new avatar look. */
export const OUTFIT_PROMPT_MAX_CHARS = 1000;

export const SCRIPT_SOURCES = Object.freeze({
  MANUAL: 'MANUAL',
  // Reserved for future features — not implemented yet:
  // TEMPLATE: 'TEMPLATE',
  // AI: 'AI',
});

/* ------------------------------------------------------------------ */
/* Widget                                                              */
/* ------------------------------------------------------------------ */

export const WIDGET_POSITIONS = Object.freeze(['bottom-right', 'bottom-left']);
/** Seconds after page load before the widget appears. 0 = immediate. */
export const WIDGET_DELAYS = Object.freeze([0, 3, 5, 10]);
export const WIDGET_THEMES = Object.freeze(['light', 'dark']);
/**
 * compact — smaller card on phones
 * bubble  — only the avatar bubble on phones, visitor taps to expand
 * hidden  — widget does not render on phones
 */
export const WIDGET_MOBILE_BEHAVIORS = Object.freeze(['compact', 'bubble', 'hidden']);
export const WIDGET_ATTENTION_ANIMATIONS = Object.freeze(['wave', 'pulse', 'bounce', 'none']);
export const WIDGET_WIDTH = Object.freeze({ MIN: 240, MAX: 380, DEFAULT: 300 });
export const DEFAULT_ACCENT_COLOR = '#6d5dfc';
/**
 * Extra pixels added on top of the widget's built-in corner spacing (20px desktop, 14px mobile) —
 * lets a site owner nudge the widget away from something else already in that corner (their own
 * chat bubble, a cookie banner, etc.) instead of only choosing left vs right.
 */
export const WIDGET_OFFSET = Object.freeze({ MIN: 0, MAX: 300, DEFAULT: 0 });

export const WIDGET_DEFAULTS = Object.freeze({
  position: 'bottom-right',
  delay: 3,
  autoplay: true,
  muted: true,
  showCaptions: true,
  showLiveIndicator: true,
  theme: 'light',
  accentColor: DEFAULT_ACCENT_COLOR,
  width: WIDGET_WIDTH.DEFAULT,
  mobileBehavior: 'compact',
  attentionAnimation: 'wave',
  offsetX: WIDGET_OFFSET.DEFAULT,
  offsetY: WIDGET_OFFSET.DEFAULT,
  enabled: true,
});

/* ------------------------------------------------------------------ */
/* Script                                                              */
/* ------------------------------------------------------------------ */

/** Fallback limits. The server may override these via env; the client reads the effective values from /api/config. */
export const SCRIPT_LIMITS = Object.freeze({
  MAX_CHARS: 1500,
  WORDS_PER_MINUTE: 150,
  MIN_SECONDS: 3,
  MAX_SECONDS: 180,
});

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  EMAIL_IN_USE: 'EMAIL_IN_USE',
  RATE_LIMITED: 'RATE_LIMITED',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  PLAN_NOT_ALLOWED: 'PLAN_NOT_ALLOWED',
  AVATAR_NOT_AVAILABLE: 'AVATAR_NOT_AVAILABLE',
  CONSENT_REQUIRED: 'CONSENT_REQUIRED',
  AVATAR_NOT_READY: 'AVATAR_NOT_READY',
  AVATAR_SLOT_REQUIRED: 'AVATAR_SLOT_REQUIRED',
  SCRIPT_INVALID: 'SCRIPT_INVALID',
  GENERATION_IN_PROGRESS: 'GENERATION_IN_PROGRESS',
  VIDEO_NOT_READY: 'VIDEO_NOT_READY',
  HEYGEN_ERROR: 'HEYGEN_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  WEBHOOK_SIGNATURE_INVALID: 'WEBHOOK_SIGNATURE_INVALID',
  WEBHOOK_ERROR: 'WEBHOOK_ERROR',
  CSRF_REJECTED: 'CSRF_REJECTED',
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});
