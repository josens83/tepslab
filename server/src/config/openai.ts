import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

/**
 * Initialize OpenAI client
 */
export const initOpenAI = (): OpenAI | null => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  OpenAI API key not configured, AI features will be disabled');
    return null;
  }

  try {
    openaiClient = new OpenAI({
      apiKey,
    });

    console.log('✅ OpenAI client initialized');
    return openaiClient;
  } catch (error) {
    console.error('Failed to initialize OpenAI:', error);
    return null;
  }
};

/**
 * Get OpenAI client instance
 */
export const getOpenAIClient = (): OpenAI | null => {
  return openaiClient;
};

/**
 * Check if OpenAI is available
 */
export const isOpenAIAvailable = (): boolean => {
  return openaiClient !== null;
};
