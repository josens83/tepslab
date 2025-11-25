"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnershipStats = exports.addFeedback = exports.updateProgress = exports.addStudySession = exports.getUserPartnerships = exports.completePartnership = exports.cancelPartnership = exports.acceptPartnership = exports.sendPartnershipRequest = exports.findMatches = exports.deactivateRequest = exports.updatePartnerRequest = exports.getUserRequests = exports.getPartnerRequest = exports.createPartnerRequest = void 0;
const partnerMatchingService_1 = require("../services/partnerMatchingService");
const mongoose_1 = __importDefault(require("mongoose"));
// Partner Request Controllers
const createPartnerRequest = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const request = await partnerMatchingService_1.PartnerMatchingService.createPartnerRequest(userId, req.body);
        res.status(201).json({
            success: true,
            message: 'Partner request created successfully',
            data: request
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPartnerRequest = createPartnerRequest;
const getPartnerRequest = async (req, res, next) => {
    try {
        const requestId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const request = await partnerMatchingService_1.PartnerMatchingService.getRequestById(requestId);
        if (!request) {
            res.status(404).json({
                success: false,
                message: 'Partner request not found'
            });
            return;
        }
        res.json({
            success: true,
            data: request
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPartnerRequest = getPartnerRequest;
const getUserRequests = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const requests = await partnerMatchingService_1.PartnerMatchingService.getUserRequests(userId);
        res.json({
            success: true,
            data: requests
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserRequests = getUserRequests;
const updatePartnerRequest = async (req, res, next) => {
    try {
        const requestId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const request = await partnerMatchingService_1.PartnerMatchingService.updatePartnerRequest(requestId, userId, req.body);
        res.json({
            success: true,
            message: 'Partner request updated successfully',
            data: request
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePartnerRequest = updatePartnerRequest;
const deactivateRequest = async (req, res, next) => {
    try {
        const requestId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        await partnerMatchingService_1.PartnerMatchingService.deactivateRequest(requestId, userId);
        res.json({
            success: true,
            message: 'Partner request deactivated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deactivateRequest = deactivateRequest;
const findMatches = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const limit = Number(req.query.limit) || 10;
        const matches = await partnerMatchingService_1.PartnerMatchingService.findMatches(userId, limit);
        res.json({
            success: true,
            data: matches
        });
    }
    catch (error) {
        next(error);
    }
};
exports.findMatches = findMatches;
// Partnership Controllers
const sendPartnershipRequest = async (req, res, next) => {
    try {
        const requesterId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { targetUserId } = req.body;
        const partnership = await partnerMatchingService_1.PartnerMatchingService.sendPartnershipRequest(requesterId, new mongoose_1.default.Types.ObjectId(targetUserId));
        res.status(201).json({
            success: true,
            message: 'Partnership request sent successfully',
            data: partnership
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendPartnershipRequest = sendPartnershipRequest;
const acceptPartnership = async (req, res, next) => {
    try {
        const partnershipId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const partnership = await partnerMatchingService_1.PartnerMatchingService.acceptPartnership(partnershipId, userId);
        res.json({
            success: true,
            message: 'Partnership accepted successfully',
            data: partnership
        });
    }
    catch (error) {
        next(error);
    }
};
exports.acceptPartnership = acceptPartnership;
const cancelPartnership = async (req, res, next) => {
    try {
        const partnershipId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        await partnerMatchingService_1.PartnerMatchingService.cancelPartnership(partnershipId, userId);
        res.json({
            success: true,
            message: 'Partnership cancelled successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelPartnership = cancelPartnership;
const completePartnership = async (req, res, next) => {
    try {
        const partnershipId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const partnership = await partnerMatchingService_1.PartnerMatchingService.completePartnership(partnershipId, userId);
        res.json({
            success: true,
            message: 'Partnership completed successfully',
            data: partnership
        });
    }
    catch (error) {
        next(error);
    }
};
exports.completePartnership = completePartnership;
const getUserPartnerships = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const status = req.query.status;
        const partnerships = await partnerMatchingService_1.PartnerMatchingService.getUserPartnerships(userId, status);
        res.json({
            success: true,
            data: partnerships
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserPartnerships = getUserPartnerships;
const addStudySession = async (req, res, next) => {
    try {
        const partnershipId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const partnership = await partnerMatchingService_1.PartnerMatchingService.addStudySession(partnershipId, userId, req.body);
        res.json({
            success: true,
            message: 'Study session added successfully',
            data: partnership
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addStudySession = addStudySession;
const updateProgress = async (req, res, next) => {
    try {
        const partnershipId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const partnership = await partnerMatchingService_1.PartnerMatchingService.updateProgress(partnershipId, userId, req.body);
        res.json({
            success: true,
            message: 'Progress updated successfully',
            data: partnership
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProgress = updateProgress;
const addFeedback = async (req, res, next) => {
    try {
        const partnershipId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { rating, comment } = req.body;
        const partnership = await partnerMatchingService_1.PartnerMatchingService.addFeedback(partnershipId, userId, rating, comment);
        res.json({
            success: true,
            message: 'Feedback added successfully',
            data: partnership
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addFeedback = addFeedback;
const getPartnershipStats = async (req, res, next) => {
    try {
        const partnershipId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const stats = await partnerMatchingService_1.PartnerMatchingService.getPartnershipStats(partnershipId);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPartnershipStats = getPartnershipStats;
//# sourceMappingURL=partnerMatchingController.js.map