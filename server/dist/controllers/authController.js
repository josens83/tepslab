"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appleAuth = exports.githubCallback = exports.githubAuth = exports.facebookCallback = exports.facebookAuth = exports.googleCallback = exports.googleAuth = exports.naverCallback = exports.naverAuth = exports.kakaoCallback = exports.kakaoAuth = exports.getCurrentUser = exports.login = exports.register = void 0;
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
        const { email, password, twoFactorToken } = req.body;
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
        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
            // If 2FA token not provided, request it
            if (!twoFactorToken) {
                res.json({
                    success: true,
                    message: 'Two-factor authentication required',
                    data: {
                        requiresTwoFactor: true,
                        userId: user._id.toString(),
                    },
                });
                return;
            }
            // Verify 2FA token
            const { TwoFactorService } = await Promise.resolve().then(() => __importStar(require('../services/twoFactorService')));
            const verification = await TwoFactorService.verifyLogin(user._id.toString(), twoFactorToken);
            if (!verification.valid) {
                throw new errorHandler_1.ApiError(401, 'Invalid two-factor authentication code');
            }
            // Warn if backup code was used
            if (verification.usedBackupCode) {
                console.warn(`User ${user.email} used a backup code for 2FA`);
            }
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
                    twoFactorEnabled: user.twoFactorEnabled,
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
/**
 * @route   GET /api/auth/google
 * @desc    Redirect to Google OAuth
 * @access  Public
 */
const googleAuth = (_req, res) => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
    res.redirect(googleAuthUrl);
};
exports.googleAuth = googleAuth;
/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            throw new errorHandler_1.ApiError(400, 'Authorization code not provided');
        }
        // Exchange code for access token
        const tokenResponse = await axios_1.default.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        });
        const { access_token } = tokenResponse.data;
        // Get user info
        const userResponse = await axios_1.default.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const googleUser = userResponse.data;
        // Find or create user
        let user = await User_1.User.findOne({
            provider: 'google',
            providerId: googleUser.id,
        });
        if (!user) {
            // Check if email already exists
            if (googleUser.email) {
                const existingUser = await User_1.User.findOne({
                    email: googleUser.email,
                });
                if (existingUser) {
                    throw new errorHandler_1.ApiError(400, 'Email already registered with another method');
                }
            }
            // Create new user
            user = await User_1.User.create({
                email: googleUser.email || `google_${googleUser.id}@tepslab.com`,
                name: googleUser.name || 'Google User',
                provider: 'google',
                providerId: googleUser.id,
                isEmailVerified: googleUser.verified_email || false,
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
        console.error('Google OAuth error:', error);
        res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_failed`);
    }
};
exports.googleCallback = googleCallback;
/**
 * @route   GET /api/auth/facebook
 * @desc    Redirect to Facebook OAuth
 * @access  Public
 */
const facebookAuth = (_req, res) => {
    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&scope=email,public_profile`;
    res.redirect(facebookAuthUrl);
};
exports.facebookAuth = facebookAuth;
/**
 * @route   GET /api/auth/facebook/callback
 * @desc    Facebook OAuth callback
 * @access  Public
 */
const facebookCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            throw new errorHandler_1.ApiError(400, 'Authorization code not provided');
        }
        // Exchange code for access token
        const tokenResponse = await axios_1.default.get('https://graph.facebook.com/v18.0/oauth/access_token', {
            params: {
                client_id: process.env.FACEBOOK_CLIENT_ID,
                client_secret: process.env.FACEBOOK_CLIENT_SECRET,
                redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
                code,
            },
        });
        const { access_token } = tokenResponse.data;
        // Get user info
        const userResponse = await axios_1.default.get('https://graph.facebook.com/me', {
            params: {
                fields: 'id,name,email',
                access_token,
            },
        });
        const facebookUser = userResponse.data;
        // Find or create user
        let user = await User_1.User.findOne({
            provider: 'facebook',
            providerId: facebookUser.id,
        });
        if (!user) {
            // Check if email already exists
            if (facebookUser.email) {
                const existingUser = await User_1.User.findOne({
                    email: facebookUser.email,
                });
                if (existingUser) {
                    throw new errorHandler_1.ApiError(400, 'Email already registered with another method');
                }
            }
            // Create new user
            user = await User_1.User.create({
                email: facebookUser.email || `facebook_${facebookUser.id}@tepslab.com`,
                name: facebookUser.name || 'Facebook User',
                provider: 'facebook',
                providerId: facebookUser.id,
                isEmailVerified: !!facebookUser.email,
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
        console.error('Facebook OAuth error:', error);
        res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_failed`);
    }
};
exports.facebookCallback = facebookCallback;
/**
 * @route   GET /api/auth/github
 * @desc    Redirect to GitHub OAuth
 * @access  Public
 */
const githubAuth = (_req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user:email`;
    res.redirect(githubAuthUrl);
};
exports.githubAuth = githubAuth;
/**
 * @route   GET /api/auth/github/callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
const githubCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            throw new errorHandler_1.ApiError(400, 'Authorization code not provided');
        }
        // Exchange code for access token
        const tokenResponse = await axios_1.default.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: process.env.GITHUB_REDIRECT_URI,
        }, {
            headers: {
                Accept: 'application/json',
            },
        });
        const { access_token } = tokenResponse.data;
        // Get user info
        const userResponse = await axios_1.default.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const githubUser = userResponse.data;
        // Get primary email if not public
        let email = githubUser.email;
        if (!email) {
            const emailResponse = await axios_1.default.get('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            const primaryEmail = emailResponse.data.find((e) => e.primary);
            email = primaryEmail?.email;
        }
        // Find or create user
        let user = await User_1.User.findOne({
            provider: 'github',
            providerId: githubUser.id.toString(),
        });
        if (!user) {
            // Check if email already exists
            if (email) {
                const existingUser = await User_1.User.findOne({ email });
                if (existingUser) {
                    throw new errorHandler_1.ApiError(400, 'Email already registered with another method');
                }
            }
            // Create new user
            user = await User_1.User.create({
                email: email || `github_${githubUser.id}@tepslab.com`,
                name: githubUser.name || githubUser.login || 'GitHub User',
                provider: 'github',
                providerId: githubUser.id.toString(),
                isEmailVerified: !!email,
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
        console.error('GitHub OAuth error:', error);
        res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_failed`);
    }
};
exports.githubCallback = githubCallback;
/**
 * @route   POST /api/auth/apple
 * @desc    Apple Sign In
 * @access  Public
 */
const appleAuth = async (req, res) => {
    try {
        const { identityToken, user: appleUser } = req.body;
        if (!identityToken) {
            throw new errorHandler_1.ApiError(400, 'Identity token not provided');
        }
        // Verify Apple identity token (simplified - in production use apple-signin-auth library)
        // For now, we'll decode the JWT to get user info
        const decoded = JSON.parse(Buffer.from(identityToken.split('.')[1], 'base64').toString());
        const appleUserId = decoded.sub;
        const email = decoded.email;
        // Find or create user
        let user = await User_1.User.findOne({
            provider: 'apple',
            providerId: appleUserId,
        });
        if (!user) {
            // Check if email already exists
            if (email) {
                const existingUser = await User_1.User.findOne({ email });
                if (existingUser) {
                    throw new errorHandler_1.ApiError(400, 'Email already registered with another method');
                }
            }
            // Create new user
            user = await User_1.User.create({
                email: email || `apple_${appleUserId}@tepslab.com`,
                name: appleUser?.name
                    ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim()
                    : 'Apple User',
                provider: 'apple',
                providerId: appleUserId,
                isEmailVerified: !!email,
            });
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
        console.error('Apple Sign In error:', error);
        if (error instanceof errorHandler_1.ApiError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Server error during Apple Sign In',
            });
        }
    }
};
exports.appleAuth = appleAuth;
//# sourceMappingURL=authController.js.map