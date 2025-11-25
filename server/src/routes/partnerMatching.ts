import express from 'express';
import * as partnerMatchingController from '../controllers/partnerMatchingController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Partner Request Routes

/**
 * @route   POST /api/partner-matching/requests
 * @desc    Create a partner request
 * @access  Private
 */
router.post('/requests', auth, partnerMatchingController.createPartnerRequest);

/**
 * @route   GET /api/partner-matching/requests/my-requests
 * @desc    Get user's partner requests
 * @access  Private
 */
router.get('/requests/my-requests', auth, partnerMatchingController.getUserRequests);

/**
 * @route   GET /api/partner-matching/requests/:id
 * @desc    Get partner request by ID
 * @access  Private
 */
router.get('/requests/:id', auth, partnerMatchingController.getPartnerRequest);

/**
 * @route   PUT /api/partner-matching/requests/:id
 * @desc    Update partner request
 * @access  Private
 */
router.put('/requests/:id', auth, partnerMatchingController.updatePartnerRequest);

/**
 * @route   DELETE /api/partner-matching/requests/:id
 * @desc    Deactivate partner request
 * @access  Private
 */
router.delete('/requests/:id', auth, partnerMatchingController.deactivateRequest);

/**
 * @route   GET /api/partner-matching/matches
 * @desc    Find potential partner matches
 * @access  Private
 */
router.get('/matches', auth, partnerMatchingController.findMatches);

// Partnership Routes

/**
 * @route   POST /api/partner-matching/partnerships
 * @desc    Send partnership request
 * @access  Private
 */
router.post('/partnerships', auth, partnerMatchingController.sendPartnershipRequest);

/**
 * @route   GET /api/partner-matching/partnerships
 * @desc    Get user's partnerships
 * @access  Private
 */
router.get('/partnerships', auth, partnerMatchingController.getUserPartnerships);

/**
 * @route   POST /api/partner-matching/partnerships/:id/accept
 * @desc    Accept partnership request
 * @access  Private
 */
router.post('/partnerships/:id/accept', auth, partnerMatchingController.acceptPartnership);

/**
 * @route   POST /api/partner-matching/partnerships/:id/cancel
 * @desc    Cancel partnership
 * @access  Private
 */
router.post('/partnerships/:id/cancel', auth, partnerMatchingController.cancelPartnership);

/**
 * @route   POST /api/partner-matching/partnerships/:id/complete
 * @desc    Complete partnership
 * @access  Private
 */
router.post('/partnerships/:id/complete', auth, partnerMatchingController.completePartnership);

/**
 * @route   POST /api/partner-matching/partnerships/:id/sessions
 * @desc    Add study session to partnership
 * @access  Private
 */
router.post('/partnerships/:id/sessions', auth, partnerMatchingController.addStudySession);

/**
 * @route   PUT /api/partner-matching/partnerships/:id/progress
 * @desc    Update partnership progress
 * @access  Private
 */
router.put('/partnerships/:id/progress', auth, partnerMatchingController.updateProgress);

/**
 * @route   POST /api/partner-matching/partnerships/:id/feedback
 * @desc    Add feedback for partnership
 * @access  Private
 */
router.post('/partnerships/:id/feedback', auth, partnerMatchingController.addFeedback);

/**
 * @route   GET /api/partner-matching/partnerships/:id/stats
 * @desc    Get partnership statistics
 * @access  Private
 */
router.get('/partnerships/:id/stats', auth, partnerMatchingController.getPartnershipStats);

export default router;
