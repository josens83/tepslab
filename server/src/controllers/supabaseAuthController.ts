import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import prisma from '../config/prisma';

/**
 * Register a new user
 */
export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, phone, targetScore } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        message: 'Email, password, and name are required',
      });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          target_score: targetScore,
        },
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Profile is auto-created via database trigger
    // Update with additional fields if needed
    if (data.user && (phone || targetScore)) {
      await prisma.profile.update({
        where: { id: data.user.id },
        data: {
          phone,
          targetScore,
        },
      });
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
      } : null,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { id: data.user.id },
      include: {
        userLevel: true,
      },
    });

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name,
        role: profile?.role,
        level: profile?.userLevel?.level || 1,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
}

/**
 * Logout user
 */
export async function logout(req: Request, res: Response) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Logout successful' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
}

/**
 * Refresh token
 */
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    res.json({
      session: {
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
        expiresAt: data.session?.expires_at,
      },
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
}

/**
 * Get current user profile
 */
export async function getMe(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: req.user.id },
      include: {
        userLevel: true,
        learningProfile: true,
        enrollments: {
          include: { course: true },
          where: { status: 'active' },
          take: 5,
          orderBy: { lastAccessedAt: 'desc' },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ user: profile });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name, phone, birthDate, targetScore, currentLevel, avatarUrl } = req.body;

    const profile = await prisma.profile.update({
      where: { id: req.user.id },
      data: {
        name,
        phone,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        targetScore,
        currentLevel,
        avatarUrl,
      },
    });

    res.json({ user: profile });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/auth/reset-password`,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Password reset email sent' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
}

/**
 * Reset password
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
}

/**
 * OAuth login - redirect to provider
 */
export async function oauthLogin(req: Request, res: Response) {
  try {
    const { provider } = req.params;

    const validProviders = ['google', 'kakao', 'naver', 'github', 'facebook', 'apple'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({ message: 'Invalid OAuth provider' });
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${process.env.CLIENT_URL}/auth/callback`,
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ url: data.url });
  } catch (error: any) {
    console.error('OAuth login error:', error);
    res.status(500).json({ message: 'OAuth login failed' });
  }
}
