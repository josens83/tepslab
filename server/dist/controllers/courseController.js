"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEnrollment = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourseById = exports.getFeaturedCourses = exports.getCourses = void 0;
const Course_1 = require("../models/Course");
const Enrollment_1 = require("../models/Enrollment");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * @route   GET /api/courses
 * @desc    Get all courses with filtering and pagination
 * @access  Public
 */
const getCourses = async (req, res) => {
    try {
        const { targetScore, level, category, minPrice, maxPrice, search, sort = '-createdAt', page = 1, limit = 12, } = req.query;
        // Build query
        const query = { isPublished: true };
        if (targetScore) {
            query.targetScore = parseInt(targetScore);
        }
        if (level) {
            query.level = level;
        }
        if (category) {
            query.category = category;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice)
                query.price.$gte = parseInt(minPrice);
            if (maxPrice)
                query.price.$lte = parseInt(maxPrice);
        }
        if (search) {
            query.$text = { $search: search };
        }
        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Execute query
        const [courses, total] = await Promise.all([
            Course_1.Course.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .select('-lessons'), // Exclude lessons from list view
            Course_1.Course.countDocuments(query),
        ]);
        res.json({
            success: true,
            data: {
                courses,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch courses',
        });
    }
};
exports.getCourses = getCourses;
/**
 * @route   GET /api/courses/featured
 * @desc    Get featured courses
 * @access  Public
 */
const getFeaturedCourses = async (_req, res) => {
    try {
        const courses = await Course_1.Course.find({
            isPublished: true,
            isFeatured: true,
        })
            .sort('-rating -enrolledCount')
            .limit(6)
            .select('-lessons');
        res.json({
            success: true,
            data: { courses },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured courses',
        });
    }
};
exports.getFeaturedCourses = getFeaturedCourses;
/**
 * @route   GET /api/courses/:id
 * @desc    Get single course by ID
 * @access  Public
 */
const getCourseById = async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            throw new errorHandler_1.ApiError(404, 'Course not found');
        }
        if (!course.isPublished) {
            throw new errorHandler_1.ApiError(403, 'This course is not published');
        }
        res.json({
            success: true,
            data: { course },
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
                error: 'Failed to fetch course',
            });
        }
    }
};
exports.getCourseById = getCourseById;
/**
 * @route   POST /api/courses
 * @desc    Create a new course (Admin only)
 * @access  Private/Admin
 */
const createCourse = async (req, res) => {
    try {
        const course = await Course_1.Course.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: { course },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create course',
        });
    }
};
exports.createCourse = createCourse;
/**
 * @route   PUT /api/courses/:id
 * @desc    Update a course (Admin only)
 * @access  Private/Admin
 */
const updateCourse = async (req, res) => {
    try {
        const course = await Course_1.Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!course) {
            throw new errorHandler_1.ApiError(404, 'Course not found');
        }
        res.json({
            success: true,
            message: 'Course updated successfully',
            data: { course },
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
                error: 'Failed to update course',
            });
        }
    }
};
exports.updateCourse = updateCourse;
/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course (Admin only)
 * @access  Private/Admin
 */
const deleteCourse = async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            throw new errorHandler_1.ApiError(404, 'Course not found');
        }
        // Check if any users are enrolled
        const enrollmentCount = await Enrollment_1.Enrollment.countDocuments({
            courseId: course._id,
            status: 'active',
        });
        if (enrollmentCount > 0) {
            throw new errorHandler_1.ApiError(400, 'Cannot delete course with active enrollments');
        }
        await course.deleteOne();
        res.json({
            success: true,
            message: 'Course deleted successfully',
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
                error: 'Failed to delete course',
            });
        }
    }
};
exports.deleteCourse = deleteCourse;
/**
 * @route   GET /api/courses/:id/check-enrollment
 * @desc    Check if user is enrolled in course
 * @access  Private
 */
const checkEnrollment = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const enrollment = await Enrollment_1.Enrollment.findOne({
            userId: req.user._id,
            courseId: req.params.id,
            status: 'active',
        });
        res.json({
            success: true,
            data: {
                isEnrolled: !!enrollment,
                enrollment: enrollment || null,
            },
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
                error: 'Failed to check enrollment',
            });
        }
    }
};
exports.checkEnrollment = checkEnrollment;
//# sourceMappingURL=courseController.js.map