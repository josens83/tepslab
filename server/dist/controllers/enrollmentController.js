"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelEnrollment = exports.updateProgress = exports.getEnrollmentById = exports.getMyEnrollments = exports.enrollCourse = void 0;
const Course_1 = require("../models/Course");
const Enrollment_1 = require("../models/Enrollment");
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * @route   POST /api/enrollments
 * @desc    Enroll in a course
 * @access  Private
 */
const enrollCourse = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const { courseId, paymentId } = req.body;
        if (!courseId) {
            throw new errorHandler_1.ApiError(400, 'Course ID is required');
        }
        // Check if course exists
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            throw new errorHandler_1.ApiError(404, 'Course not found');
        }
        if (!course.isPublished) {
            throw new errorHandler_1.ApiError(400, 'This course is not available for enrollment');
        }
        // Check if already enrolled
        const existingEnrollment = await Enrollment_1.Enrollment.findOne({
            userId: req.user._id,
            courseId,
        });
        if (existingEnrollment) {
            throw new errorHandler_1.ApiError(400, 'Already enrolled in this course');
        }
        // Initialize progress for all lessons
        const progress = course.lessons.map((lesson, index) => ({
            lessonId: lesson._id?.toString() || `lesson-${index}`,
            completed: false,
            lastWatchedAt: new Date(),
            watchDuration: 0,
        }));
        // Create enrollment
        const enrollment = await Enrollment_1.Enrollment.create({
            userId: req.user._id,
            courseId,
            progress,
            paymentId,
            status: 'active',
        });
        // Update course enrolled count
        await Course_1.Course.findByIdAndUpdate(courseId, {
            $inc: { enrolledCount: 1 },
        });
        // Update user's enrolled courses
        await User_1.User.findByIdAndUpdate(req.user._id, {
            $addToSet: { enrolledCourses: courseId },
        });
        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course',
            data: { enrollment },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.ApiError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Failed to enroll in course',
            });
        }
    }
};
exports.enrollCourse = enrollCourse;
/**
 * @route   GET /api/enrollments
 * @desc    Get user's enrollments
 * @access  Private
 */
const getMyEnrollments = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const { status } = req.query;
        const query = { userId: req.user._id };
        if (status) {
            query.status = status;
        }
        const enrollments = await Enrollment_1.Enrollment.find(query)
            .populate('courseId')
            .sort('-enrolledAt');
        res.json({
            success: true,
            data: { enrollments },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.ApiError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch enrollments',
            });
        }
    }
};
exports.getMyEnrollments = getMyEnrollments;
/**
 * @route   GET /api/enrollments/:id
 * @desc    Get single enrollment
 * @access  Private
 */
const getEnrollmentById = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const enrollment = await Enrollment_1.Enrollment.findById(req.params.id).populate('courseId');
        if (!enrollment) {
            throw new errorHandler_1.ApiError(404, 'Enrollment not found');
        }
        // Check if user owns this enrollment
        if (enrollment.userId.toString() !== req.user._id) {
            throw new errorHandler_1.ApiError(403, 'Not authorized to access this enrollment');
        }
        res.json({
            success: true,
            data: { enrollment },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.ApiError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch enrollment',
            });
        }
    }
};
exports.getEnrollmentById = getEnrollmentById;
/**
 * @route   PUT /api/enrollments/:id/progress
 * @desc    Update lesson progress
 * @access  Private
 */
const updateProgress = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const { lessonId, completed, watchDuration } = req.body;
        const enrollment = await Enrollment_1.Enrollment.findById(req.params.id);
        if (!enrollment) {
            throw new errorHandler_1.ApiError(404, 'Enrollment not found');
        }
        // Check if user owns this enrollment
        if (enrollment.userId.toString() !== req.user._id) {
            throw new errorHandler_1.ApiError(403, 'Not authorized to update this enrollment');
        }
        // Find and update progress
        const progressIndex = enrollment.progress.findIndex((p) => p.lessonId === lessonId);
        if (progressIndex === -1) {
            throw new errorHandler_1.ApiError(404, 'Lesson not found in enrollment');
        }
        enrollment.progress[progressIndex].completed = completed;
        enrollment.progress[progressIndex].lastWatchedAt = new Date();
        if (watchDuration !== undefined) {
            enrollment.progress[progressIndex].watchDuration = watchDuration;
        }
        if (completed && !enrollment.progress[progressIndex].completedAt) {
            enrollment.progress[progressIndex].completedAt = new Date();
        }
        enrollment.lastAccessedAt = new Date();
        await enrollment.save(); // This will trigger pre-save hook to calculate completion percentage
        res.json({
            success: true,
            message: 'Progress updated successfully',
            data: { enrollment },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.ApiError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Failed to update progress',
            });
        }
    }
};
exports.updateProgress = updateProgress;
/**
 * @route   DELETE /api/enrollments/:id
 * @desc    Cancel enrollment (soft delete)
 * @access  Private
 */
const cancelEnrollment = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const enrollment = await Enrollment_1.Enrollment.findById(req.params.id);
        if (!enrollment) {
            throw new errorHandler_1.ApiError(404, 'Enrollment not found');
        }
        // Check if user owns this enrollment
        if (enrollment.userId.toString() !== req.user._id) {
            throw new errorHandler_1.ApiError(403, 'Not authorized to cancel this enrollment');
        }
        enrollment.status = 'cancelled';
        await enrollment.save();
        // Update course enrolled count
        await Course_1.Course.findByIdAndUpdate(enrollment.courseId, {
            $inc: { enrolledCount: -1 },
        });
        res.json({
            success: true,
            message: 'Enrollment cancelled successfully',
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.ApiError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Failed to cancel enrollment',
            });
        }
    }
};
exports.cancelEnrollment = cancelEnrollment;
//# sourceMappingURL=enrollmentController.js.map