"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOpenAIAvailable = exports.getOpenAIClient = exports.initOpenAI = void 0;
const openai_1 = __importDefault(require("openai"));
let openaiClient = null;
/**
 * Initialize OpenAI client
 */
const initOpenAI = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.warn('⚠️  OpenAI API key not configured, AI features will be disabled');
        return null;
    }
    try {
        openaiClient = new openai_1.default({
            apiKey,
        });
        console.log('✅ OpenAI client initialized');
        return openaiClient;
    }
    catch (error) {
        console.error('Failed to initialize OpenAI:', error);
        return null;
    }
};
exports.initOpenAI = initOpenAI;
/**
 * Get OpenAI client instance
 */
const getOpenAIClient = () => {
    return openaiClient;
};
exports.getOpenAIClient = getOpenAIClient;
/**
 * Check if OpenAI is available
 */
const isOpenAIAvailable = () => {
    return openaiClient !== null;
};
exports.isOpenAIAvailable = isOpenAIAvailable;
//# sourceMappingURL=openai.js.map