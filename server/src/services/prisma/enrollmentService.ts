import prisma from '../../config/prisma';
import { Enrollment, EnrollmentStatus, Prisma } from '@prisma/client';
import { CourseService } from './courseService';

export interface EnrollInput {
  userId: string;
  courseId: string;
  paymentId?: string;
  expiresAt?: Date;
}

export interface UpdateProgressInput {
  lessonId: string;
  completed?: boolean;
  watchDuration?: number;
}

export class EnrollmentService {
  /**
   * Enroll user in a course
   */
  static async enroll(input: EnrollInput) {
    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: input.userId,
          courseId: input.courseId,
        },
      },
    });

    if (existing) {
      if (existing.status === 'cancelled' || existing.status === 'expired') {
        // Reactivate enrollment
        return prisma.enrollment.update({
          where: { id: existing.id },
          data: {
            status: 'active',
            enrolledAt: new Date(),
            expiresAt: input.expiresAt,
            paymentId: input.paymentId,
            progress: [],
            completionPercentage: 0,
          },
        });
      }
      throw new Error('Already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: input.userId,
        courseId: input.courseId,
        paymentId: input.paymentId,
        expiresAt: input.expiresAt,
      },
    });

    // Increment course enrollment count
    await CourseService.incrementEnrolled(input.courseId);

    return enrollment;
  }

  /**
   * Get enrollment by ID
   */
  static async getById(id: string) {
    return prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Get user's enrollment for a course
   */
  static async getUserEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      include: {
        course: true,
      },
    });
  }

  /**
   * Check if user is enrolled
   */
  static async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    return enrollment?.status === 'active' || enrollment?.status === 'completed';
  }

  /**
   * Update lesson progress
   */
  static async updateProgress(enrollmentId: string, input: UpdateProgressInput) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Get current progress
    const progress = (enrollment.progress as any[]) || [];
    const existingIndex = progress.findIndex((p) => p.lessonId === input.lessonId);

    const now = new Date();
    const lessonProgress = {
      lessonId: input.lessonId,
      completed: input.completed || false,
      completedAt: input.completed ? now : null,
      lastWatchedAt: now,
      watchDuration: input.watchDuration || 0,
    };

    if (existingIndex >= 0) {
      // Update existing progress
      progress[existingIndex] = {
        ...progress[existingIndex],
        ...lessonProgress,
        watchDuration: (progress[existingIndex].watchDuration || 0) + (input.watchDuration || 0),
      };
    } else {
      // Add new progress
      progress.push(lessonProgress);
    }

    // Calculate completion percentage
    const totalLessons = enrollment.course.lessonsCount || 1;
    const completedLessons = progress.filter((p) => p.completed).length;
    const completionPercentage = Math.round((completedLessons / totalLessons) * 100);

    // Update enrollment
    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        completionPercentage,
        lastAccessedAt: now,
        status: completionPercentage === 100 ? 'completed' : 'active',
      },
    });
  }

  /**
   * Get user's enrollments
   */
  static async getUserEnrollments(userId: string, status?: EnrollmentStatus) {
    const where: Prisma.EnrollmentWhereInput = { userId };

    if (status) {
      where.status = status;
    }

    return prisma.enrollment.findMany({
      where,
      include: {
        course: true,
      },
      orderBy: { lastAccessedAt: 'desc' },
    });
  }

  /**
   * Cancel enrollment
   */
  static async cancel(enrollmentId: string) {
    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'cancelled' },
    });
  }

  /**
   * Check and update expired enrollments
   */
  static async updateExpiredEnrollments() {
    return prisma.enrollment.updateMany({
      where: {
        status: 'active',
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: 'expired',
      },
    });
  }
}

export default EnrollmentService;
