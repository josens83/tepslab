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
const studyGroupController = __importStar(require("../controllers/studyGroupController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * @route   POST /api/study-groups
 * @desc    Create a new study group
 * @access  Private
 */
router.post('/', auth_1.auth, studyGroupController.createGroup);
/**
 * @route   GET /api/study-groups
 * @desc    Get all study groups with filters
 * @access  Public
 */
router.get('/', studyGroupController.getGroups);
/**
 * @route   GET /api/study-groups/my-groups
 * @desc    Get user's study groups
 * @access  Private
 */
router.get('/my-groups', auth_1.auth, studyGroupController.getUserGroups);
/**
 * @route   GET /api/study-groups/recommended
 * @desc    Get recommended study groups
 * @access  Private
 */
router.get('/recommended', auth_1.auth, studyGroupController.getRecommendedGroups);
/**
 * @route   GET /api/study-groups/:id
 * @desc    Get study group by ID
 * @access  Public
 */
router.get('/:id', studyGroupController.getGroup);
/**
 * @route   PUT /api/study-groups/:id
 * @desc    Update study group
 * @access  Private (Admin/Owner)
 */
router.put('/:id', auth_1.auth, studyGroupController.updateGroup);
/**
 * @route   DELETE /api/study-groups/:id
 * @desc    Delete/Archive study group
 * @access  Private (Owner)
 */
router.delete('/:id', auth_1.auth, studyGroupController.deleteGroup);
/**
 * @route   POST /api/study-groups/:id/join
 * @desc    Join a study group
 * @access  Private
 */
router.post('/:id/join', auth_1.auth, studyGroupController.joinGroup);
/**
 * @route   POST /api/study-groups/:id/leave
 * @desc    Leave a study group
 * @access  Private
 */
router.post('/:id/leave', auth_1.auth, studyGroupController.leaveGroup);
/**
 * @route   PUT /api/study-groups/:id/members/role
 * @desc    Update member role
 * @access  Private (Admin/Owner)
 */
router.put('/:id/members/role', auth_1.auth, studyGroupController.updateMemberRole);
/**
 * @route   POST /api/study-groups/:id/sessions
 * @desc    Schedule a study session
 * @access  Private (Members)
 */
router.post('/:id/sessions', auth_1.auth, studyGroupController.scheduleSession);
/**
 * @route   POST /api/study-groups/:id/sessions/:sessionIndex/attend
 * @desc    Attend a study session
 * @access  Private (Members)
 */
router.post('/:id/sessions/:sessionIndex/attend', auth_1.auth, studyGroupController.attendSession);
/**
 * @route   POST /api/study-groups/:id/sessions/:sessionIndex/complete
 * @desc    Complete a study session
 * @access  Private (Admin/Owner)
 */
router.post('/:id/sessions/:sessionIndex/complete', auth_1.auth, studyGroupController.completeSession);
/**
 * @route   GET /api/study-groups/:id/stats
 * @desc    Get group statistics
 * @access  Public
 */
router.get('/:id/stats', studyGroupController.getGroupStats);
exports.default = router;
//# sourceMappingURL=studyGroup.js.map