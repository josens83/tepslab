"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aiTutorController_1 = require("../controllers/aiTutorController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All routes are protected (require authentication)
router.use(authMiddleware_1.protect);
// AI Tutor status
router.get('/status', aiTutorController_1.getTutorStatus);
// Chat with AI tutor
router.post('/chat', aiTutorController_1.chatWithTutor);
// Explain a question
router.post('/explain', aiTutorController_1.explainQuestion);
// Analyze weak points
router.post('/analyze', aiTutorController_1.analyzeWeakPoints);
// Generate practice questions
router.post('/generate-questions', aiTutorController_1.generatePracticeQuestions);
// Evaluate pronunciation
router.post('/evaluate-pronunciation', aiTutorController_1.evaluatePronunciation);
exports.default = router;
//# sourceMappingURL=aiTutorRoutes.js.map