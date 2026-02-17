/**
 * Webhook event types that can be subscribed to.
 * Format: resource.action
 */
export const WEBHOOK_EVENT_TYPES = [
  'speech.recorded',
  'speech.validated',
  'question.submitted',
  'question.answered',
  'sentence.submitted',
  'sentence.validated',
  'transcription.submitted',
  'transcription.reviewed',
  'user.signed_up',
  'export.completed',
  'feedback.submitted',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];
