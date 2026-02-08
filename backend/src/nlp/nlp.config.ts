/**
 * NLP Feature Configuration
 * Set to false to disable placeholder features that return fake data
 */
export const NLP_CONFIG = {
  // Set to true when actual NLP APIs are integrated
  ENABLE_NER_PROCESSING: process.env.ENABLE_NER_PROCESSING === 'true',
  ENABLE_POS_PROCESSING: process.env.ENABLE_POS_PROCESSING === 'true',
  ENABLE_TRANSLATION: process.env.ENABLE_TRANSLATION === 'true',
  ENABLE_SENTIMENT: process.env.ENABLE_SENTIMENT === 'true',
  ENABLE_EMOTION: process.env.ENABLE_EMOTION === 'true',
};
