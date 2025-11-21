import crypto from 'crypto';

/**
 * Encryption service for protecting sensitive data at rest
 */
export class EncryptionService {
  private static algorithm = 'aes-256-gcm';
  private static keyLength = 32; // 256 bits
  private static ivLength = 16; // 128 bits
  private static saltLength = 64;
  private static tagLength = 16;

  /**
   * Get encryption key from environment or generate one
   */
  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
      console.warn('⚠️  ENCRYPTION_KEY not set in environment variables');
      // Use a deterministic key in development (NOT for production)
      return crypto.scryptSync('default-dev-key', 'salt', this.keyLength);
    }

    // Derive key from the encryption key string
    return crypto.scryptSync(key, 'tepslab-encryption-salt', this.keyLength);
  }

  /**
   * Encrypt sensitive data
   * Returns base64-encoded encrypted data with IV and auth tag
   */
  static encrypt(plaintext: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);

      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Combine IV + authTag + encrypted data
      const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'hex'),
      ]);

      return combined.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt encrypted data
   */
  static decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      const combined = Buffer.from(encryptedData, 'base64');

      // Extract IV, authTag, and encrypted data
      const iv = combined.subarray(0, this.ivLength);
      const authTag = combined.subarray(
        this.ivLength,
        this.ivLength + this.tagLength
      );
      const encrypted = combined.subarray(this.ivLength + this.tagLength);

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive data (one-way)
   * Useful for storing data that needs to be verified but not retrieved
   */
  static hash(data: string): string {
    const salt = crypto.randomBytes(this.saltLength);
    const hash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');

    // Return salt + hash as base64
    return Buffer.concat([salt, hash]).toString('base64');
  }

  /**
   * Verify hashed data
   */
  static verifyHash(data: string, hashedData: string): boolean {
    try {
      const combined = Buffer.from(hashedData, 'base64');
      const salt = combined.subarray(0, this.saltLength);
      const originalHash = combined.subarray(this.saltLength);

      const hash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');

      return crypto.timingSafeEqual(hash, originalHash);
    } catch (error) {
      console.error('Hash verification error:', error);
      return false;
    }
  }

  /**
   * Generate a secure random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random string (alphanumeric)
   */
  static generateRandomString(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      result += chars[randomBytes[i] % chars.length];
    }

    return result;
  }

  /**
   * Hash a password with bcrypt-like security
   */
  static async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16);

      crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(salt.toString('hex') + ':' + derivedKey.toString('hex'));
      });
    });
  }

  /**
   * Verify a password hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');
      const saltBuffer = Buffer.from(salt, 'hex');

      crypto.pbkdf2(password, saltBuffer, 310000, 32, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
      });
    });
  }

  /**
   * Encrypt an object (converts to JSON first)
   */
  static encryptObject(obj: any): string {
    const json = JSON.stringify(obj);
    return this.encrypt(json);
  }

  /**
   * Decrypt an encrypted object
   */
  static decryptObject<T>(encryptedData: string): T {
    const json = this.decrypt(encryptedData);
    return JSON.parse(json) as T;
  }

  /**
   * Mask sensitive data for logging (show first/last few characters)
   */
  static maskSensitive(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars * 2) {
      return '*'.repeat(data.length);
    }

    const start = data.substring(0, visibleChars);
    const end = data.substring(data.length - visibleChars);
    const masked = '*'.repeat(data.length - visibleChars * 2);

    return `${start}${masked}${end}`;
  }

  /**
   * Generate encryption key (for initial setup)
   */
  static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('base64');
  }
}
