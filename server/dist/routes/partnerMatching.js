"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const partnerMatchingController = __importStar(require("../controllers/partnerMatchingController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Partner Request Routes
/**
 * @route   POST /api/partner-matching/requests
 * @desc    Create a partner request
 * @access  Private
 */
router.post('/requests', auth_1.auth, partnerMatchingController.createPartnerRequest);
/**
 * @route   GET /api/partner-matching/requests/my-requests
 * @desc    Get user's partner requests
 * @access  Private
 */
router.get('/requests/my-requests', auth_1.auth, partnerMatchingController.getUserRequests);
/**
 * @route   GET /api/partner-matching/requests/:id
 * @desc    Get partner request by ID
 * @access  Private
 */
router.get('/requests/:id', auth_1.auth, partnerMatchingController.getPartnerRequest);
/**
 * @route   PUT /api/partner-matching/requests/:id
 * @desc    Update partner request
 * @access  Private
 */
router.put('/requests/:id', auth_1.auth, partnerMatchingController.updatePartnerRequest);
/**
 * @route   DELETE /api/partner-matching/requests/:id
 * @desc    Deactivate partner request
 * @access  Private
 */
router.delete('/requests/:id', auth_1.auth, partnerMatchingController.deactivateRequest);
/**
 * @route   GET /api/partner-matching/matches
 * @desc    Find potential partner matches
 * @access  Private
 */
router.get('/matches', auth_1.auth, partnerMatchingController.findMatches);
// Partnership Routes
/**
 * @route   POST /api/partner-matching/partnerships
 * @desc    Send partnership request
 * @access  Private
 */
router.post('/partnerships', auth_1.auth, partnerMatchingController.sendPartnershipRequest);
/**
 * @route   GET /api/partner-matching/partnerships
 * @desc    Get user's partnerships
 * @access  Private
 */
router.get('/partnerships', auth_1.auth, partnerMatchingController.getUserPartnerships);
/**
 * @route   POST /api/partner-matching/partnerships/:id/accept
 * @desc    Accept partnership request
 * @access  Private
 */
router.post('/partnerships/:id/accept', auth_1.auth, partnerMatchingController.acceptPartnership);
/**
 * @route   POST /api/partner-matching/partnerships/:id/cancel
 * @desc    Cancel partnership
 * @access  Private
 */
router.post('/partnerships/:id/cancel', auth_1.auth, partnerMatchingController.cancelPartnership);
/**
 * @route   POST /api/partner-matching/partnerships/:id/complete
 * @desc    Complete partnership
 * @access  Private
 */
router.post('/partnerships/:id/complete', auth_1.auth, partnerMatchingController.completePartnership);
/**
 * @route   POST /api/partner-matching/partnerships/:id/sessions
 * @desc    Add study session to partnership
 * @access  Private
 */
router.post('/partnerships/:id/sessions', auth_1.auth, partnerMatchingController.addStudySession);
/**
 * @route   PUT /api/partner-matching/partnerships/:id/progress
 * @desc    Update partnership progress
 * @access  Private
 */
router.put('/partnerships/:id/progress', auth_1.auth, partnerMatchingController.updateProgress);
/**
 * @route   POST /api/partner-matching/partnerships/:id/feedback
 * @desc    Add feedback for partnership
 * @access  Private
 */
router.post('/partnerships/:id/feedback', auth_1.auth, partnerMatchingController.addFeedback);
/**
 * @route   GET /api/partner-matching/partnerships/:id/stats
 * @desc    Get partnership statistics
 * @access  Private
 */
router.get('/partnerships/:id/stats', auth_1.auth, partnerMatchingController.getPartnershipStats);
exports.default = router;
//# sourceMappingURL=partnerMatching.js.map