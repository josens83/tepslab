"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.naverCallback = exports.naverAuth = exports.kakaoCallback = exports.kakaoAuth = exports.getCurrentUser = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
const axios_1 = __importDefault(require("axios"));
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res) => {
    try {
        const { email, password, name, phone, birthDate, targetScore } = req.body;
        // Validate required fields
        if (!email || !password || !name) {
            throw new errorHandler_1.ApiError(400, 'Please provide email, password, and name');
        }
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            throw new errorHandler_1.ApiError(400, 'User already exists with this email');
        }
        // Create user
        const user = await User_1.User.create({
            email,
            password,
            name,
            phone,
            birthDate,
            targetScore,
            provider: 'local',
        });
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
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
                error: 'Server error during registration',
            });
        }
    }
};
exports.register = register;
/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            throw new errorHandler_1.ApiError(400, 'Please provide email and password');
        }
        // Find user and include password field
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user) {
            throw new errorHandler_1.ApiError(401, 'Invalid credentials');
        }
        // Check if user registered with social login
        if (user.provider !== 'local') {
            throw new errorHandler_1.ApiError(400, `Please login with ${user.provider}`);
        }
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new errorHandler_1.ApiError(401, 'Invalid credentials');
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
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
                error: 'Server error during login',
            });
        }
    }
};
exports.login = login;
/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const user = await User_1.User.findById(req.user._id);
        if (!user) {
            throw new errorHandler_1.ApiError(404, 'User not found');
        }
        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    birthDate: user.birthDate,
                    targetScore: user.targetScore,
                    currentLevel: user.currentLevel,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    enrolledCourses: user.enrolledCourses,
                    createdAt: user.createdAt,
                },
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
                error: 'Server error',
            });
        }
    }
};
exports.getCurrentUser = getCurrentUser;
/**
 * @route   GET /api/auth/kakao
 * @desc    Redirect to Kakao OAuth
 * @access  Public
 */
const kakaoAuth = (_req, res) => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
    res.redirect(kakaoAuthUrl);
};
exports.kakaoAuth = kakaoAuth;
/**
 * @route   GET /api/auth/kakao/callback
 * @desc    Kakao OAuth callback
 * @access  Public
 */
const kakaoCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            throw new errorHandler_1.ApiError(400, 'Authorization code not provided');
        }
        // Exchange code for access token
        const tokenResponse = await axios_1.default.post('https://kauth.kakao.com/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_CLIENT_ID,
                redirect_uri: process.env.KAKAO_REDIRECT_URI,
                code,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const { access_token } = tokenResponse.data;
        // Get user info
        const userResponse = await axios_1.default.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const kakaoUser = userResponse.data;
        const kakaoAccount = kakaoUser.kakao_account;
        // Find or create user
        let user = await User_1.User.findOne({
            provider: 'kakao',
            providerId: kakaoUser.id.toString(),
        });
        if (!user) {
            // Check if email already exists
            if (kakaoAccount.email) {
                const existingUser = await User_1.User.findOne({
                    email: kakaoAccount.email,
                });
                if (existingUser) {
                    throw new errorHandler_1.ApiError(400, 'Email already registered with another method');
                }
            }
            // Create new user
            user = await User_1.User.create({
                email: kakaoAccount.email || `kakao_${kakaoUser.id}@tepslab.com`,
                name: kakaoAccount.profile?.nickname || 'Kakao User',
                provider: 'kakao',
                providerId: kakaoUser.id.toString(),
                isEmailVerified: kakaoAccount.is_email_verified || false,
            });
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        // Redirect to frontend with token
        res.redirect(`${process.env.CORS_ORIGIN}/auth/callback?token=${token}`);
    }
    catch (error) {
        console.error('Kakao OAuth error:', error);
        res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_failed`);
    }
};
exports.kakaoCallback = kakaoCallback;
/**
 * @route   GET /api/auth/naver
 * @desc    Redirect to Naver OAuth
 * @access  Public
 */
const naverAuth = (_req, res) => {
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&state=random_state`;
    res.redirect(naverAuthUrl);
};
exports.naverAuth = naverAuth;
/**
 * @route   GET /api/auth/naver/callback
 * @desc    Naver OAuth callback
 * @access  Public
 */
const naverCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code) {
            throw new errorHandler_1.ApiError(400, 'Authorization code not provided');
        }
        // Exchange code for access token
        const tokenResponse = await axios_1.default.get('https://nid.naver.com/oauth2.0/token', {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.NAVER_CLIENT_ID,
                client_secret: process.env.NAVER_CLIENT_SECRET,
                code,
                state,
            },
        });
        const { access_token } = tokenResponse.data;
        // Get user info
        const userResponse = await axios_1.default.get('https://openapi.naver.com/v1/nid/me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const naverUser = userResponse.data.response;
        // Find or create user
        let user = await User_1.User.findOne({
            provider: 'naver',
            providerId: naverUser.id,
        });
        if (!user) {
            // Check if email already exists
            if (naverUser.email) {
                const existingUser = await User_1.User.findOne({
                    email: naverUser.email,
                });
                if (existingUser) {
                    throw new errorHandler_1.ApiError(400, 'Email already registered with another method');
                }
            }
            // Create new user
            user = await User_1.User.create({
                email: naverUser.email || `naver_${naverUser.id}@tepslab.com`,
                name: naverUser.name || naverUser.nickname || 'Naver User',
                provider: 'naver',
                providerId: naverUser.id,
                phone: naverUser.mobile?.replace(/-/g, ''),
                birthDate: naverUser.birthyear && naverUser.birthday
                    ? new Date(`${naverUser.birthyear}-${naverUser.birthday.replace('-', '-')}`)
                    : undefined,
                isEmailVerified: true,
            });
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        // Redirect to frontend with token
        res.redirect(`${process.env.CORS_ORIGIN}/auth/callback?token=${token}`);
    }
    catch (error) {
        console.error('Naver OAuth error:', error);
        res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_failed`);
    }
};
exports.naverCallback = naverCallback;
//# sourceMappingURL=authController.js.map