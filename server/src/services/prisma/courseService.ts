import prisma from '../../config/prisma';
import { Course, CourseLevel, CourseCategory, Prisma } from '@prisma/client';
import { getPaginationParams, createPaginatedResult, PaginationParams } from '../../lib/db';

export interface CreateCourseInput {
  title: string;
  description: string;
  instructorId?: string;
  instructorName: string;
  thumbnailUrl?: string;
  targetScore: number;
  level: CourseLevel;
  category: CourseCategory;
  price: number;
  discountPrice?: number;
  duration: number;
  lessons?: any[];
  features?: string[];
  curriculum?: string[];
  requirements?: string[];
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  discountPrice?: number;
  lessons?: any[];
  features?: string[];
  curriculum?: string[];
  requirements?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface CourseFilters {
  targetScore?: number;
  level?: CourseLevel;
  category?: CourseCategory;
  isPublished?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export class CourseService {
  /**
   * Create a new course
   */
  static async create(input: CreateCourseInput) {
    const lessonsCount = input.lessons?.length || 0;

    return prisma.course.create({
      data: {
        ...input,
        lessons: input.lessons || [],
        lessonsCount,
      },
    });
  }

  /**
   * Get course by ID
   */
  static async getById(id: string, includeUnpublished = false) {
    const where: Prisma.CourseWhereInput = { id };

    if (!includeUnpublished) {
      where.isPublished = true;
    }

    return prisma.course.findFirst({
      where,
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Get all courses with filters and pagination
   */
  static async getAll(params: PaginationParams & CourseFilters) {
    const { page, limit, skip } = getPaginationParams(params);

    const where: Prisma.CourseWhereInput = {};

    if (params.targetScore) {
      where.targetScore = params.targetScore;
    }

    if (params.level) {
      where.level = params.level;
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.isPublished !== undefined) {
      where.isPublished = params.isPublished;
    } else {
      where.isPublished = true; // Default to published only
    }

    if (params.isFeatured !== undefined) {
      where.isFeatured = params.isFeatured;
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) {
        where.price.gte = params.minPrice;
      }
      if (params.maxPrice !== undefined) {
        where.price.lte = params.maxPrice;
      }
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isFeatured: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.course.count({ where }),
    ]);

    return createPaginatedResult(courses, total, page, limit);
  }

  /**
   * Get featured courses
   */
  static async getFeatured(limit = 6) {
    return prisma.course.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      take: limit,
      orderBy: { rating: 'desc' },
    });
  }

  /**
   * Get popular courses
   */
  static async getPopular(limit = 10) {
    return prisma.course.findMany({
      where: { isPublished: true },
      take: limit,
      orderBy: { enrolledCount: 'desc' },
    });
  }

  /**
   * Update a course
   */
  static async update(id: string, input: UpdateCourseInput) {
    const data: Prisma.CourseUpdateInput = { ...input };

    if (input.lessons) {
      data.lessonsCount = input.lessons.length;
    }

    return prisma.course.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a course
   */
  static async delete(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  }

  /**
   * Update course rating
   */
  static async updateRating(courseId: string) {
    const result = await prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return prisma.course.update({
      where: { id: courseId },
      data: {
        rating: result._avg.rating || 0,
        reviewsCount: result._count.rating,
      },
    });
  }

  /**
   * Increment enrolled count
   */
  static async incrementEnrolled(courseId: string) {
    return prisma.course.update({
      where: { id: courseId },
      data: {
        enrolledCount: { increment: 1 },
      },
    });
  }

  /**
   * Get course by instructor
   */
  static async getByInstructor(instructorId: string) {
    return prisma.course.findMany({
      where: { instructorId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default CourseService;
