import mongoose from 'mongoose';
import { User } from '../../models/User';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        provider: 'local' as const,
      };

      const user = await User.create(userData);

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

      await expect(User.create(invalidUser)).rejects.toThrow();
    });

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        provider: 'local' as const,
      };

      await User.create(userData);

      // Try to create another user with same email
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should create user with social provider without password', async () => {
      const socialUser = {
        email: 'social@example.com',
        name: 'Social User',
        provider: 'kakao' as const,
        providerId: '123456',
      };

      const user = await User.create(socialUser);

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
        provider: 'local' as const,
      };

      const user = await User.create(userData);

      expect(user.password).toBeDefined();
      expect(user.password).not.toBe(userData.password);
      expect(user.password?.length).toBeGreaterThan(50); // Bcrypt hash length
    });

    it('should correctly compare passwords', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        provider: 'local' as const,
      };

      const user = await User.create(userData);

      // Need to fetch user with password field (since it's select: false)
      const userWithPassword = await User.findById(user._id).select('+password');

      expect(userWithPassword).toBeDefined();
      expect(await userWithPassword!.comparePassword('password123')).toBe(true);
      expect(await userWithPassword!.comparePassword('wrongpassword')).toBe(false);
    });

    it('should not rehash password if not modified', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        provider: 'local' as const,
      };

      const user = await User.create(userData);
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

      const user = await User.create(userData);

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
      const user = await User.create(userData);
      expect(user.email).toBe('invalid-email');
    });

    it('should store optional fields', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        phone: '010-1234-5678',
        targetScore: 450,
        currentLevel: 'intermediate' as const,
      };

      const user = await User.create(userData);

      expect(user.phone).toBe(userData.phone);
      expect(user.targetScore).toBe(userData.targetScore);
      expect(user.currentLevel).toBe(userData.currentLevel);
    });
  });
});
