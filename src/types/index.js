/**
 * Shared JSDoc types for API payloads (mirrors server/src/utils/serializers.js).
 *
 * @typedef {'STARTER'|'GROWTH'} Plan
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'user'|'admin'} role
 * @property {Plan} plan
 * @property {number} credits
 * @property {number} avatarSlots
 *
 * @typedef {Object} Avatar
 * @property {string} id
 * @property {'STOCK'|'CUSTOM'} type
 * @property {string} name
 * @property {string} gender
 * @property {string} style
 * @property {string|null} thumbnailUrl
 * @property {string|null} previewVideoUrl
 * @property {boolean} isReady
 * @property {string} [trainingStatus]
 * @property {{ status: string, url: string|null, expiresAt: string|null, approvedAt: string|null, rejectionReason: string|null }} [consent]
 *
 * @typedef {Object} Caption
 * @property {number} start
 * @property {number} end
 * @property {string} text
 *
 * @typedef {Object} Video
 * @property {string} id
 * @property {string} title
 * @property {'QUEUED'|'PROCESSING'|'COMPLETED'|'FAILED'|'CANCELLED'} status
 * @property {'queued'|'rendering'|'finalizing'|'ready'|'failed'} stage
 * @property {{ id: string, name?: string, thumbnailUrl?: string, type?: string }} avatar
 * @property {string} script
 * @property {string|null} ctaText
 * @property {string|null} ctaUrl
 * @property {number} estimatedDuration
 * @property {number|null} duration
 * @property {string|null} videoUrl
 * @property {string|null} thumbnailUrl
 * @property {Caption[]} captions
 * @property {number} creditsReserved
 * @property {number} creditsCharged
 * @property {{ code: string, message: string }|null} error
 * @property {{ id: string, publicWidgetId: string, name: string, enabled: boolean }[]} widgets
 * @property {string} createdAt
 *
 * @typedef {Object} Widget
 * @property {string} id
 * @property {string} publicWidgetId
 * @property {string} videoId
 * @property {string} name
 * @property {'bottom-right'|'bottom-left'} position
 * @property {0|3|5|10} delay
 * @property {boolean} autoplay
 * @property {boolean} muted
 * @property {boolean} showCaptions
 * @property {boolean} showLiveIndicator
 * @property {string|null} primaryCtaText
 * @property {string|null} primaryCtaUrl
 * @property {'light'|'dark'} theme
 * @property {string} accentColor
 * @property {number} width
 * @property {'compact'|'bubble'|'hidden'} mobileBehavior
 * @property {'wave'|'pulse'|'bounce'|'none'} attentionAnimation
 * @property {boolean} enabled
 * @property {string} embedCode
 */
export {};
