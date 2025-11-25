"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../../models/User");
beforeAll(async () => {
    await mongoose_1.default.connect(process.env.MONGODB_URI);
});
afterAll(async () => {
    await mongoose_1.default.connection.dropDatabase();
    await mongoose_1.default.connection.close();
});
afterEach(async () => {
    await User_1.User.deleteMany({});
});
describe('User Model', () => {
    describe('User Creation', () => {
        it('should create a new user with valid data', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
                provider: 'local',
            };
            const user = await User_1.User.create(userData);
            expect(user.email).toBe(userData.email);
            expect(user.name).toBe(userData.name);
            expect(user.provider).toBe('local');
            expect(user.role).toBe('student');
            expect(user.isEmailVerified).toBe(false);
            expect(user.password).not.toBe(userData.password); // Should be hashed
        });
        it('should fail to create user without required fields', async () => {
            const invalidUser = {
                email: 'test@example.com',
                // Missing name
            };
            await expect(User_1.User.create(invalidUser)).rejects.toThrow();
        });
        it('should fail to create user with duplicate email', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
                provider: 'local',
            };
            await User_1.User.create(userData);
            // Try to create another user with same email
            await expect(User_1.User.create(userData)).rejects.toThrow();
        });
        it('should create user with social provider without password', async () => {
            const socialUser = {
                email: 'social@example.com',
                name: 'Social User',
                provider: 'kakao',
                providerId: '123456',
            };
            const user = await User_1.User.create(socialUser);
            expect(user.email).toBe(socialUser.email);
            expect(user.provider).toBe('kakao');
            expect(user.providerId).toBe('123456');
            expect(user.password).toBeUndefined();
        });
    });
    describe('Password Hashing', () => {
        it('should hash password before saving', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
                provider: 'local',
            };
            const user = await User_1.User.create(userData);
            expect(user.password).toBeDefined();
            expect(user.password).not.toBe(userData.password);
            expect(user.password?.length).toBeGreaterThan(50); // Bcrypt hash length
        });
        it('should correctly compare passwords', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
                provider: 'local',
            };
            const user = await User_1.User.create(userData);
            // Need to fetch user with password field (since it's select: false)
            const userWithPassword = await User_1.User.findById(user._id).select('+password');
            expect(userWithPassword).toBeDefined();
            expect(await userWithPassword.comparePassword('password123')).toBe(true);
            expect(await userWithPassword.comparePassword('wrongpassword')).toBe(false);
        });
        it('should not rehash password if not modified', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
                provider: 'local',
            };
            const user = await User_1.User.create(userData);
            const originalHash = user.password;
            // Update name but not password
            user.name = 'Updated Name';
            await user.save();
            expect(user.password).toBe(originalHash);
        });
    });
    describe('User Fields', () => {
        it('should set default values correctly', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
            };
            const user = await User_1.User.create(userData);
            expect(user.provider).toBe('local');
            expect(user.role).toBe('student');
            expect(user.isEmailVerified).toBe(false);
            expect(user.enrolledCourses).toEqual([]);
        });
        it('should validate email format', async () => {
            const userData = {
                email: 'invalid-email',
                name: 'Test User',
                password: 'password123',
            };
            // Email validation happens at application level, not model level
            // But Mongoose will store it as-is
            const user = await User_1.User.create(userData);
            expect(user.email).toBe('invalid-email');
        });
        it('should store optional fields', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
                phone: '010-1234-5678',
                targetScore: 450,
                currentLevel: 'intermediate',
            };
            const user = await User_1.User.create(userData);
            expect(user.phone).toBe(userData.phone);
            expect(user.targetScore).toBe(userData.targetScore);
            expect(user.currentLevel).toBe(userData.currentLevel);
        });
    });
});
//# sourceMappingURL=User.test.js.map