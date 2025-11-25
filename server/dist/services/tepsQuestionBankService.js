"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEPSQuestionBankService = void 0;
const TEPSQuestion_1 = require("../models/TEPSQuestion");
const openai_1 = require("../config/openai");
/**
 * TEPS Question Bank Service
 * Manages the massive question database and AI-based question generation
 */
class TEPSQuestionBankService {
    /**
     * Generate questions using AI (OpenAI GPT-4)
     */
    static async generateQuestionsWithAI(request) {
        const openai = (0, openai_1.getOpenAIClient)();
        if (!openai) {
            throw new Error('OpenAI client not configured');
        }
        const count = request.count || 1;
        const questions = [];
        for (let i = 0; i < count; i++) {
            const prompt = this.buildGenerationPrompt(request);
            try {
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4-turbo-preview',
                    messages: [
                        {
                            role: 'system',
                            content: this.getSystemPromptForSection(request.section),
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature: 0.7,
                    response_format: { type: 'json_object' },
                });
                const response = completion.choices[0].message.content;
                if (!response) {
                    throw new Error('Empty response from OpenAI');
                }
                const questionData = JSON.parse(response);
                const question = await this.createQuestionFromAI(questionData, request);
                questions.push(question);
            }
            catch (error) {
                console.error('Error generating question with AI:', error);
                throw error;
            }
        }
        return questions;
    }
    /**
     * Build generation prompt based on request
     */
    static buildGenerationPrompt(request) {
        const { section, questionType, difficultyLevel, topic, style } = request;
        let prompt = `Generate a TEPS ${section} question with the following specifications:\n\n`;
        prompt += `- Question Type: ${questionType}\n`;
        prompt += `- Difficulty Level: ${difficultyLevel} (1=Very Easy, 5=Very Hard)\n`;
        prompt += `- Topic: ${topic}\n`;
        prompt += `- Style: ${style || 'official'} (mimic official TEPS exam style)\n\n`;
        prompt += `Requirements:\n`;
        prompt += `1. The question must be high-quality and realistic\n`;
        prompt += `2. Include 4 options (A, B, C, D) with only one correct answer\n`;
        prompt += `3. Distractors should be plausible but clearly incorrect\n`;
        prompt += `4. Provide detailed explanation for the correct answer\n`;
        prompt += `5. Include key points, tips, and related concepts\n`;
        prompt += `6. Follow official TEPS format and difficulty standards\n\n`;
        // Section-specific requirements
        if (section === TEPSQuestion_1.TEPSSection.LISTENING) {
            prompt += `For listening questions:\n`;
            prompt += `- Provide a realistic conversation or talk transcript\n`;
            prompt += `- Specify number of speakers and accent type\n`;
            prompt += `- Ensure audio would be 30-60 seconds long\n\n`;
        }
        else if (section === TEPSQuestion_1.TEPSSection.READING) {
            prompt += `For reading questions:\n`;
            prompt += `- Provide a complete passage (150-300 words)\n`;
            prompt += `- Specify genre, reading level, and word count\n`;
            prompt += `- Ensure passage is engaging and appropriate\n\n`;
        }
        else if (section === TEPSQuestion_1.TEPSSection.VOCABULARY) {
            prompt += `For vocabulary questions:\n`;
            prompt += `- Use academic and professional vocabulary\n`;
            prompt += `- Include context if needed\n`;
            prompt += `- Ensure options are at similar difficulty level\n\n`;
        }
        else if (section === TEPSQuestion_1.TEPSSection.GRAMMAR) {
            prompt += `For grammar questions:\n`;
            prompt += `- Focus on common grammar points tested in TEPS\n`;
            prompt += `- Include sentence context\n`;
            prompt += `- Explain the grammatical rule clearly\n\n`;
        }
        prompt += `Return the question in JSON format with these fields:\n`;
        prompt += `{
  "questionText": "string",
  "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
  "correctAnswer": "A|B|C|D",
  "explanation": "string",
  "keyPoints": ["string"],
  "tips": ["string"],
  "relatedConcepts": ["string"],
  "keywords": ["string"],
  "audioTranscript": "string (for listening only)",
  "audioSpeakers": number (for listening only),
  "audioAccent": "american|british|canadian|australian (for listening only)",
  "passageContent": "string (for reading only)",
  "passageGenre": "academic|business|news|literature|science (for reading only)",
  "passageReadingLevel": "A1|A2|B1|B2|C1|C2 (for reading only)"
}`;
        return prompt;
    }
    /**
     * Get system prompt for specific section
     */
    static getSystemPromptForSection(section) {
        const basePrompt = `You are an expert TEPS (Test of English Proficiency developed by Seoul National University) question writer. You have analyzed thousands of official TEPS questions and understand the exact format, difficulty levels, and question patterns used in the exam.`;
        const sectionPrompts = {
            [TEPSQuestion_1.TEPSSection.LISTENING]: `${basePrompt} You specialize in creating listening comprehension questions that test understanding of conversations, talks, and lectures in academic and professional contexts.`,
            [TEPSQuestion_1.TEPSSection.VOCABULARY]: `${basePrompt} You specialize in creating vocabulary questions that test knowledge of academic and professional English words, including definitions, synonyms, and contextual usage.`,
            [TEPSQuestion_1.TEPSSection.GRAMMAR]: `${basePrompt} You specialize in creating grammar questions that test understanding of English grammar rules, sentence structure, and error identification commonly tested in TEPS.`,
            [TEPSQuestion_1.TEPSSection.READING]: `${basePrompt} You specialize in creating reading comprehension questions based on academic and professional passages, testing main ideas, details, inferences, and vocabulary in context.`,
        };
        return sectionPrompts[section];
    }
    /**
     * Create question document from AI-generated data
     */
    static async createQuestionFromAI(data, request) {
        const questionData = {
            questionType: request.questionType,
            section: request.section,
            difficultyLevel: request.difficultyLevel,
            questionText: data.questionText,
            options: data.options,
            correctAnswer: data.correctAnswer,
            explanation: data.explanation,
            keyPoints: data.keyPoints || [],
            tips: data.tips || [],
            relatedConcepts: data.relatedConcepts || [],
            topic: request.topic,
            tags: [request.section, request.questionType, `difficulty_${request.difficultyLevel}`],
            keywords: data.keywords || [],
            isOfficialQuestion: false,
            isAIGenerated: true,
            generationMethod: 'openai',
            generatedAt: new Date(),
            reviewStatus: 'pending',
            qualityScore: 75, // Initial score for AI-generated questions
        };
        // Add audio resource for listening questions
        if (request.section === TEPSQuestion_1.TEPSSection.LISTENING && data.audioTranscript) {
            questionData.audioResource = {
                url: '', // To be filled when audio is generated
                duration: Math.ceil(data.audioTranscript.split(' ').length / 2.5), // Estimate ~150 words/min
                transcript: data.audioTranscript,
                speakers: data.audioSpeakers || 1,
                accentType: data.audioAccent || 'american',
            };
        }
        // Add reading passage for reading questions
        if (request.section === TEPSQuestion_1.TEPSSection.READING && data.passageContent) {
            questionData.readingPassage = {
                content: data.passageContent,
                wordCount: data.passageContent.split(/\s+/).length,
                readingLevel: data.passageReadingLevel || 'B2',
                genre: data.passageGenre || 'academic',
                topic: request.topic,
            };
        }
        const question = await TEPSQuestion_1.TEPSQuestion.create(questionData);
        return question;
    }
    /**
     * Search questions with filters
     */
    static async searchQuestions(filter, limit = 50, skip = 0) {
        const query = {};
        if (filter.section) {
            query.section = filter.section;
        }
        if (filter.questionType) {
            query.questionType = filter.questionType;
        }
        if (filter.difficultyLevel) {
            if (Array.isArray(filter.difficultyLevel)) {
                query.difficultyLevel = { $in: filter.difficultyLevel };
            }
            else {
                query.difficultyLevel = filter.difficultyLevel;
            }
        }
        if (filter.topic) {
            query.topic = { $regex: filter.topic, $options: 'i' };
        }
        if (filter.tags && filter.tags.length > 0) {
            query.tags = { $in: filter.tags };
        }
        if (filter.isOfficialQuestion !== undefined) {
            query.isOfficialQuestion = filter.isOfficialQuestion;
        }
        if (filter.reviewStatus) {
            query.reviewStatus = filter.reviewStatus;
        }
        else {
            // Default to approved questions only
            query.reviewStatus = 'approved';
        }
        if (filter.minQualityScore) {
            query.qualityScore = { $gte: filter.minQualityScore };
        }
        const [questions, total] = await Promise.all([
            TEPSQuestion_1.TEPSQuestion.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }).exec(),
            TEPSQuestion_1.TEPSQuestion.countDocuments(query),
        ]);
        return { questions, total };
    }
    /**
     * Get adaptive question selection using IRT
     * Selects questions that are most informative for user's current ability level
     */
    static async selectAdaptiveQuestions(criteria, count = 10) {
        const { currentAbility, weakTopics, recentQuestions, preferredDifficulty } = criteria;
        // Build query
        const query = {
            reviewStatus: 'approved',
            _id: { $nin: recentQuestions },
        };
        // Focus on weak topics if specified
        if (weakTopics && weakTopics.length > 0) {
            query.$or = [
                { topic: { $in: weakTopics } },
                { tags: { $in: weakTopics } },
            ];
        }
        // Select questions around user's ability level for maximum information
        // IRT theory: questions at b ≈ theta provide most information
        const targetDifficulty = this.abilityToDifficulty(currentAbility);
        if (preferredDifficulty) {
            query.difficultyLevel = preferredDifficulty;
        }
        else {
            // Select questions within ±1 difficulty level of target
            query.difficultyLevel = {
                $gte: Math.max(1, targetDifficulty - 1),
                $lte: Math.min(5, targetDifficulty + 1),
            };
        }
        // Fetch more than needed and select best ones
        const candidates = await TEPSQuestion_1.TEPSQuestion.find(query)
            .limit(count * 3)
            .exec();
        // Score each question by how informative it would be
        const scoredQuestions = candidates.map((q) => ({
            question: q,
            score: this.calculateInformationValue(q, currentAbility, weakTopics),
        }));
        // Sort by information value and take top N
        scoredQuestions.sort((a, b) => b.score - a.score);
        return scoredQuestions.slice(0, count).map((sq) => sq.question);
    }
    /**
     * Convert ability (theta) to difficulty level (1-5)
     */
    static abilityToDifficulty(ability) {
        // ability ranges from -3 to +3
        // Map to difficulty 1-5
        if (ability <= -2)
            return TEPSQuestion_1.DifficultyLevel.VERY_EASY;
        if (ability <= -0.5)
            return TEPSQuestion_1.DifficultyLevel.EASY;
        if (ability <= 0.5)
            return TEPSQuestion_1.DifficultyLevel.MEDIUM;
        if (ability <= 2)
            return TEPSQuestion_1.DifficultyLevel.HARD;
        return TEPSQuestion_1.DifficultyLevel.VERY_HARD;
    }
    /**
     * Calculate information value of a question for given ability
     * Based on IRT information function
     */
    static calculateInformationValue(question, ability, weakTopics) {
        const stats = question.statistics;
        const b = stats.difficulty; // difficulty parameter
        const a = stats.discrimination; // discrimination parameter
        const c = stats.guessing; // guessing parameter
        // IRT 3PL information function: I(θ) = a² * P'(θ)² / [P(θ) * Q(θ)]
        const exponent = -a * (ability - b);
        const p = c + (1 - c) / (1 + Math.exp(exponent)); // probability of correct answer
        const q = 1 - p;
        const pPrime = a * (1 - c) * Math.exp(exponent) / Math.pow(1 + Math.exp(exponent), 2);
        const information = (a * a * pPrime * pPrime) / (p * q);
        // Boost score if question is on weak topic
        let topicBoost = 1.0;
        if (weakTopics.includes(question.topic) || question.tags.some((tag) => weakTopics.includes(tag))) {
            topicBoost = 1.5;
        }
        return information * topicBoost;
    }
    /**
     * Get question statistics and analytics
     */
    static async getQuestionBankStats() {
        const [totalQuestions, bySection, byDifficulty, byType, officialQuestions, aiGenerated, avgQuality,] = await Promise.all([
            TEPSQuestion_1.TEPSQuestion.countDocuments({ reviewStatus: 'approved' }),
            TEPSQuestion_1.TEPSQuestion.aggregate([
                { $match: { reviewStatus: 'approved' } },
                { $group: { _id: '$section', count: { $sum: 1 } } },
            ]),
            TEPSQuestion_1.TEPSQuestion.aggregate([
                { $match: { reviewStatus: 'approved' } },
                { $group: { _id: '$difficultyLevel', count: { $sum: 1 } } },
            ]),
            TEPSQuestion_1.TEPSQuestion.aggregate([
                { $match: { reviewStatus: 'approved' } },
                { $group: { _id: '$questionType', count: { $sum: 1 } } },
            ]),
            TEPSQuestion_1.TEPSQuestion.countDocuments({ reviewStatus: 'approved', isOfficialQuestion: true }),
            TEPSQuestion_1.TEPSQuestion.countDocuments({ reviewStatus: 'approved', isAIGenerated: true }),
            TEPSQuestion_1.TEPSQuestion.aggregate([
                { $match: { reviewStatus: 'approved' } },
                { $group: { _id: null, avgScore: { $avg: '$qualityScore' } } },
            ]),
        ]);
        return {
            totalQuestions,
            bySection: Object.fromEntries(bySection.map((item) => [item._id, item.count])),
            byDifficulty: Object.fromEntries(byDifficulty.map((item) => [item._id, item.count])),
            byType: Object.fromEntries(byType.map((item) => [item._id, item.count])),
            officialQuestions,
            aiGenerated,
            averageQualityScore: avgQuality[0]?.avgScore || 0,
        };
    }
    /**
     * Analyze official TEPS question patterns
     */
    static async analyzeOfficialPatterns(section) {
        const officialQuestions = await TEPSQuestion_1.TEPSQuestion.find({
            section,
            isOfficialQuestion: true,
            reviewStatus: 'approved',
        }).exec();
        // Topic frequency
        const topicMap = new Map();
        officialQuestions.forEach((q) => {
            topicMap.set(q.topic, (topicMap.get(q.topic) || 0) + 1);
        });
        const commonTopics = Array.from(topicMap.entries())
            .map(([topic, frequency]) => ({ topic, frequency }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 20);
        // Difficulty distribution
        const difficultyDistribution = {};
        officialQuestions.forEach((q) => {
            difficultyDistribution[q.difficultyLevel] =
                (difficultyDistribution[q.difficultyLevel] || 0) + 1;
        });
        // Average question length
        const totalLength = officialQuestions.reduce((sum, q) => sum + q.questionText.length, 0);
        const averageQuestionLength = totalLength / officialQuestions.length;
        // Common keywords
        const keywordMap = new Map();
        officialQuestions.forEach((q) => {
            q.keywords.forEach((keyword) => {
                keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
            });
        });
        const commonKeywords = Array.from(keywordMap.entries())
            .map(([keyword, frequency]) => ({ keyword, frequency }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 50);
        return {
            commonTopics,
            difficultyDistribution,
            averageQuestionLength,
            commonKeywords,
        };
    }
    /**
     * Bulk import questions from CSV or JSON
     */
    static async bulkImportQuestions(questions, source) {
        let imported = 0;
        let failed = 0;
        const errors = [];
        for (const questionData of questions) {
            try {
                // Validate required fields
                if (!questionData.questionType ||
                    !questionData.section ||
                    !questionData.questionText ||
                    !questionData.correctAnswer) {
                    throw new Error('Missing required fields');
                }
                // Set metadata
                questionData.isOfficialQuestion = source === 'official';
                questionData.isAIGenerated = false;
                questionData.generationMethod = 'manual';
                questionData.reviewStatus = source === 'official' ? 'approved' : 'pending';
                questionData.qualityScore = source === 'official' ? 95 : 70;
                await TEPSQuestion_1.TEPSQuestion.create(questionData);
                imported++;
            }
            catch (error) {
                failed++;
                errors.push(error.message);
            }
        }
        return { imported, failed, errors };
    }
}
exports.TEPSQuestionBankService = TEPSQuestionBankService;
//# sourceMappingURL=tepsQuestionBankService.js.map