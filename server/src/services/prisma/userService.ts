import prisma from '../../config/prisma';
import { supabaseAdmin } from '../../config/supabase';
import { Profile, UserRole, UserLevel, Prisma } from '@prisma/client';
import { getPaginationParams, createPaginatedResult, PaginationParams } from '../../lib/db';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  birthDate?: Date;
  targetScore?: number;
  currentLevel?: UserLevel;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  birthDate?: Date;
  targetScore?: number;
  currentLevel?: UserLevel;
  avatarUrl?: string;
}

export class UserService {
  /**
   * Register a new user via Supabase Auth
   */
  static async register(input: CreateUserInput) {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: false,
      user_metadata: {
        name: input.name,
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // Profile is auto-created via database trigger
    // Update with additional fields if provided
    if (input.phone || input.birthDate || input.targetScore || input.currentLevel) {
      await prisma.profile.update({
        where: { id: authData.user.id },
        data: {
          phone: input.phone,
          birthDate: input.birthDate,
          targetScore: input.targetScore,
          currentLevel: input.currentLevel,
        },
      });
    }

    return this.getById(authData.user.id);
  }

  /**
   * Get user by ID
   */
  static async getById(id: string) {
    return prisma.profile.findUnique({
      where: { id },
      include: {
        userLevel: true,
        learningProfile: true,
      },
    });
  }

  /**
   * Get user by email
   */
  static async getByEmail(email: string) {
    return prisma.profile.findUnique({
      where: { email },
    });
  }

  /**
   * Update user profile
   */
  static async update(id: string, input: UpdateUserInput) {
    return prisma.profile.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Get all users with pagination
   */
  static async getAll(params: PaginationParams & { role?: UserRole; search?: string }) {
    const { page, limit, skip } = getPaginationParams(params);

    const where: Prisma.ProfileWhereInput = {};

    if (params.role) {
      where.role = params.role;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          userLevel: true,
        },
      }),
      prisma.profile.count({ where }),
    ]);

    return createPaginatedResult(users, total, page, limit);
  }

  /**
   * Update user role (admin only)
   */
  static async updateRole(id: string, role: UserRole) {
    return prisma.profile.update({
      where: { id },
      data: { role },
    });
  }

  /**
   * Delete user
   */
  static async delete(id: string) {
    // Delete from Supabase Auth (cascade will delete profile)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }

  /**
   * Get user's enrolled courses
   */
  static async getEnrolledCourses(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  /**
   * Get user statistics
   */
  static async getStats(userId: string) {
    const [
      enrollmentCount,
      completedCourses,
      examAttempts,
      userLevel,
    ] = await Promise.all([
      prisma.enrollment.count({ where: { userId } }),
      prisma.enrollment.count({ where: { userId, status: 'completed' } }),
      prisma.tepsExamAttempt.count({ where: { userId, status: 'completed' } }),
      prisma.userLevelData.findUnique({ where: { userId } }),
    ]);

    return {
      enrollmentCount,
      completedCourses,
      examAttempts,
      level: userLevel?.level || 1,
      totalXp: userLevel?.totalXp || 0,
      streakDays: userLevel?.streakDays || 0,
    };
  }
}

export default UserService;
