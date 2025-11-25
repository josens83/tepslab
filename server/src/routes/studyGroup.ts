import express from 'express';
import * as studyGroupController from '../controllers/studyGroupController';
import { auth } from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/study-groups
 * @desc    Create a new study group
 * @access  Private
 */
router.post('/', auth, studyGroupController.createGroup);

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
router.get('/my-groups', auth, studyGroupController.getUserGroups);

/**
 * @route   GET /api/study-groups/recommended
 * @desc    Get recommended study groups
 * @access  Private
 */
router.get('/recommended', auth, studyGroupController.getRecommendedGroups);

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
router.put('/:id', auth, studyGroupController.updateGroup);

/**
 * @route   DELETE /api/study-groups/:id
 * @desc    Delete/Archive study group
 * @access  Private (Owner)
 */
router.delete('/:id', auth, studyGroupController.deleteGroup);

/**
 * @route   POST /api/study-groups/:id/join
 * @desc    Join a study group
 * @access  Private
 */
router.post('/:id/join', auth, studyGroupController.joinGroup);

/**
 * @route   POST /api/study-groups/:id/leave
 * @desc    Leave a study group
 * @access  Private
 */
router.post('/:id/leave', auth, studyGroupController.leaveGroup);

/**
 * @route   PUT /api/study-groups/:id/members/role
 * @desc    Update member role
 * @access  Private (Admin/Owner)
 */
router.put('/:id/members/role', auth, studyGroupController.updateMemberRole);

/**
 * @route   POST /api/study-groups/:id/sessions
 * @desc    Schedule a study session
 * @access  Private (Members)
 */
router.post('/:id/sessions', auth, studyGroupController.scheduleSession);

/**
 * @route   POST /api/study-groups/:id/sessions/:sessionIndex/attend
 * @desc    Attend a study session
 * @access  Private (Members)
 */
router.post('/:id/sessions/:sessionIndex/attend', auth, studyGroupController.attendSession);

/**
 * @route   POST /api/study-groups/:id/sessions/:sessionIndex/complete
 * @desc    Complete a study session
 * @access  Private (Admin/Owner)
 */
router.post('/:id/sessions/:sessionIndex/complete', auth, studyGroupController.completeSession);

/**
 * @route   GET /api/study-groups/:id/stats
 * @desc    Get group statistics
 * @access  Public
 */
router.get('/:id/stats', studyGroupController.getGroupStats);

export default router;
