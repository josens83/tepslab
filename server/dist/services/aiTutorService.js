"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiTutorService = exports.AITutorService = void 0;
const openai_1 = require("../config/openai");
/**
 * TEPS AI Tutor Service
 * Provides intelligent tutoring for TEPS preparation
 */
class AITutorService {
    systemPrompt = `You are an expert TEPS (Test of English Proficiency developed by Seoul National University) tutor with deep knowledge of:
- TEPS test format, structure, and scoring system
- Grammar rules and patterns frequently tested in TEPS
- Reading comprehension strategies
- Listening comprehension techniques
- Vocabulary building for TEPS
- Test-taking strategies and time management

Your goal is to:
1. Provide clear, accurate explanations
2. Give practical examples
3. Suggest study strategies
4. Encourage students with positive feedback
5. Adapt to the student's level (target scores: 327, 387, 450, 550)

Always respond in Korean unless specifically asked to use English.
Keep responses concise but comprehensive.`;
    /**
     * Chat with AI tutor
     */
    async chat(message, conversationHistory = [], context) {
        const openai = (0, openai_1.getOpenAIClient)();
        if (!openai) {
            throw new Error('OpenAI is not configured');
        }
        // Build messages array
        const messages = [
            { role: 'system', content: this.systemPrompt },
        ];
        // Add context if provided
        if (context) {
            let contextMessage = 'Context: ';
            if (context.topic)
                contextMessage += `Topic: ${context.topic}. `;
            if (context.difficulty)
                contextMessage += `Difficulty: ${context.difficulty}. `;
            if (context.targetScore)
                contextMessage += `Target Score: ${context.targetScore}. `;
            messages.push({ role: 'system', content: contextMessage });
        }
        // Add conversation history
        conversationHistory.forEach((msg) => {
            messages.push({ role: msg.role, content: msg.content });
        });
        // Add current message
        messages.push({ role: 'user', content: message });
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages,
                temperature: 0.7,
                max_tokens: 1000,
                presence_penalty: 0.6,
                frequency_penalty: 0.3,
            });
            const answer = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
            return {
                answer,
                suggestions: this.extractSuggestions(answer),
                relatedTopics: this.extractRelatedTopics(answer),
            };
        }
        catch (error) {
            console.error('AI Tutor chat error:', error);
            throw new Error('Failed to get AI tutor response');
        }
    }
    /**
     * Explain a TEPS question
     */
    async explainQuestion(question, options, correctAnswer, userAnswer) {
        const openai = (0, openai_1.getOpenAIClient)();
        if (!openai) {
            throw new Error('OpenAI is not configured');
        }
        const prompt = `Explain this TEPS question in detail:

Question: ${question}

Options:
${options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}

Correct Answer: ${correctAnswer}
${userAnswer ? `User's Answer: ${userAnswer}` : ''}

Please provide:
1. Why the correct answer is right
2. Why other options are wrong
3. Key grammar points or vocabulary
4. Similar patterns to watch for
5. Study tips

Answer in Korean.`;
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.5,
                max_tokens: 1500,
            });
            return response.choices[0]?.message?.content || 'Explanation not available.';
        }
        catch (error) {
            console.error('Question explanation error:', error);
            throw new Error('Failed to explain question');
        }
    }
    /**
     * Analyze student's weak points
     */
    async analyzeWeakPoints(testResults) {
        const openai = (0, openai_1.getOpenAIClient)();
        if (!openai) {
            throw new Error('OpenAI is not configured');
        }
        const prompt = `Analyze these TEPS test results and provide personalized study recommendations:

${testResults.map(result => `
Category: ${result.category}
Score: ${result.score}/${result.totalQuestions}
Incorrect: ${result.incorrectQuestions.join(', ')}
`).join('\n')}

Provide:
1. Identified weak points
2. Priority areas for improvement
3. Specific study recommendations
4. Recommended practice materials
5. Timeline for improvement

Answer in Korean with actionable advice.`;
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.6,
                max_tokens: 2000,
            });
            return response.choices[0]?.message?.content || 'Analysis not available.';
        }
        catch (error) {
            console.error('Weak points analysis error:', error);
            throw new Error('Failed to analyze weak points');
        }
    }
    /**
     * Generate practice questions
     */
    async generatePracticeQuestions(category, difficulty, count = 5) {
        const openai = (0, openai_1.getOpenAIClient)();
        if (!openai) {
            throw new Error('OpenAI is not configured');
        }
        const prompt = `Generate ${count} TEPS ${category} questions at ${difficulty} level.

For each question, provide:
1. Question text
2. 4 options (A, B, C, D)
3. Correct answer (index 0-3)
4. Brief explanation

Format as JSON array:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "..."
  }
]

Make questions realistic and aligned with TEPS format.`;
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.8,
                max_tokens: 3000,
                response_format: { type: 'json_object' },
            });
            const content = response.choices[0]?.message?.content || '{"questions": []}';
            const parsed = JSON.parse(content);
            return parsed.questions || [];
        }
        catch (error) {
            console.error('Question generation error:', error);
            throw new Error('Failed to generate practice questions');
        }
    }
    /**
     * Evaluate pronunciation (text-based analysis)
     */
    async evaluatePronunciation(targetText, transcribedText) {
        const openai = (0, openai_1.getOpenAIClient)();
        if (!openai) {
            throw new Error('OpenAI is not configured');
        }
        const prompt = `Evaluate pronunciation accuracy:

Target: "${targetText}"
Spoken (transcribed): "${transcribedText}"

Provide:
1. Accuracy score (0-100)
2. Specific mistakes
3. Pronunciation tips
4. Practice suggestions

Format as JSON:
{
  "score": 85,
  "feedback": "...",
  "mistakes": ["..."],
  "suggestions": ["..."]
}

Answer in Korean.`;
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.5,
                max_tokens: 1000,
                response_format: { type: 'json_object' },
            });
            const content = response.choices[0]?.message?.content || '{"score": 0, "feedback": "", "mistakes": [], "suggestions": []}';
            return JSON.parse(content);
        }
        catch (error) {
            console.error('Pronunciation evaluation error:', error);
            throw new Error('Failed to evaluate pronunciation');
        }
    }
    /**
     * Extract suggestions from response
     */
    extractSuggestions(text) {
        // Simple extraction - look for bullet points or numbered lists
        const suggestions = [];
        const lines = text.split('\n');
        lines.forEach((line) => {
            if (line.match(/^[\d\-\*•]\s+/) || line.includes('추천') || line.includes('제안')) {
                suggestions.push(line.trim());
            }
        });
        return suggestions.slice(0, 3);
    }
    /**
     * Extract related topics from response
     */
    extractRelatedTopics(text) {
        // Simple extraction - look for topic keywords
        const topics = [];
        const keywords = ['문법', '독해', '청해', '어휘', 'Grammar', 'Reading', 'Listening', 'Vocabulary'];
        keywords.forEach((keyword) => {
            if (text.includes(keyword) && !topics.includes(keyword)) {
                topics.push(keyword);
            }
        });
        return topics.slice(0, 5);
    }
}
exports.AITutorService = AITutorService;
exports.aiTutorService = new AITutorService();
//# sourceMappingURL=aiTutorService.js.map