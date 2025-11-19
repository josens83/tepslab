import { Request, Response } from 'express';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

/**
 * @route   GET /api/courses
 * @desc    Get all courses with filtering and pagination
 * @access  Public
 */
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      targetScore,
      level,
      category,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    // Build query
    const query: any = { isPublished: true };

    if (targetScore) {
      query.targetScore = parseInt(targetScore as string);
    }

    if (level) {
      query.level = level;
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice as string);
      if (maxPrice) query.price.$lte = parseInt(maxPrice as string);
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [courses, total] = await Promise.all([
      Course.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .select('-lessons'), // Exclude lessons from list view
      Course.countDocuments(query),
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses',
    });
  }
};

/**
 * @route   GET /api/courses/featured
 * @desc    Get featured courses
 * @access  Public
 */
export const getFeaturedCourses = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await Course.find({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured courses',
    });
  }
};

/**
 * @route   GET /api/courses/:id
 * @desc    Get single course by ID
 * @access  Public
 */
export const getCourseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    if (!course.isPublished) {
      throw new ApiError(403, 'This course is not published');
    }

    res.json({
      success: true,
      data: { course },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch course',
      });
    }
  }
};

/**
 * @route   POST /api/courses
 * @desc    Create a new course (Admin only)
 * @access  Private/Admin
 */
export const createCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create course',
    });
  }
};

/**
 * @route   PUT /api/courses/:id
 * @desc    Update a course (Admin only)
 * @access  Private/Admin
 */
export const updateCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update course',
      });
    }
  }
};

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course (Admin only)
 * @access  Private/Admin
 */
export const deleteCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Check if any users are enrolled
    const enrollmentCount = await Enrollment.countDocuments({
      courseId: course._id,
      status: 'active',
    });

    if (enrollmentCount > 0) {
      throw new ApiError(
        400,
        'Cannot delete course with active enrollments'
      );
    }

    await course.deleteOne();

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete course',
      });
    }
  }
};

/**
 * @route   GET /api/courses/:id/check-enrollment
 * @desc    Check if user is enrolled in course
 * @access  Private
 */
export const checkEnrollment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const enrollment = await Enrollment.findOne({
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
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to check enrollment',
      });
    }
  }
};
