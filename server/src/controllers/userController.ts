import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AuthRequest } from '../types';

/**
 * 프로필 조회
 * GET /api/users/profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: '프로필 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 프로필 수정
 * PUT /api/users/profile
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { name, phone, birthDate, targetScore } = req.body;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      return;
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (birthDate) user.birthDate = new Date(birthDate);
    if (targetScore) user.targetScore = targetScore;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          birthDate: user.birthDate,
          targetScore: user.targetScore,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: '프로필 수정 중 오류가 발생했습니다.' });
  }
};

/**
 * 비밀번호 변경
 * PUT /api/users/password
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: '새 비밀번호는 8자 이상이어야 합니다.' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      return;
    }

    // Check if user has password (not OAuth user)
    if (!user.password) {
      res.status(400).json({ error: '소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.' });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
      return;
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: '비밀번호가 변경되었습니다.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: '비밀번호 변경 중 오류가 발생했습니다.' });
  }
};

/**
 * 회원 탈퇴
 * DELETE /api/users/account
 */
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { password } = req.body;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: '비밀번호를 입력해주세요.' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      return;
    }

    // Check if user has password (not OAuth user)
    if (!user.password) {
      res.status(400).json({ error: '소셜 로그인 사용자는 이 방법으로 탈퇴할 수 없습니다.' });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: '회원 탈퇴가 완료되었습니다.',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: '회원 탈퇴 중 오류가 발생했습니다.' });
  }
};
