"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testController_1 = require("../controllers/testController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/tests
 * @desc    Get all available tests
 * @access  Public
 */
router.get('/', testController_1.getTests);
/**
 * @route   GET /api/tests/:id
 * @desc    Get test by ID (with questions)
 * @access  Private
 */
router.get('/:id', auth_1.authenticate, testController_1.getTestById);
/**
 * @route   POST /api/tests/:id/submit
 * @desc    Submit test answers
 * @access  Private
 */
router.post('/:id/submit', auth_1.authenticate, testController_1.submitTest);
/**
 * @route   GET /api/test-results
 * @desc    Get user's test results
 * @access  Private
 */
router.get('/results/my', auth_1.authenticate, testController_1.getMyTestResults);
/**
 * @route   GET /api/test-results/:id
 * @desc    Get specific test result
 * @access  Private
 */
router.get('/results/:id', auth_1.authenticate, testController_1.getTestResult);
/**
 * @route   POST /api/tests
 * @desc    Create a new test (admin only)
 * @access  Admin
 */
router.post('/', auth_1.authenticate, auth_1.requireAdmin, testController_1.createTest);
exports.default = router;
//# sourceMappingURL=testRoutes.js.map