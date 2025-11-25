/**
 * Encryption service for protecting sensitive data at rest
 */
export declare class EncryptionService {
    private static algorithm;
    private static keyLength;
    private static ivLength;
    private static saltLength;
    private static tagLength;
    /**
     * Get encryption key from environment or generate one
     */
    private static getEncryptionKey;
    /**
     * Encrypt sensitive data
     * Returns base64-encoded encrypted data with IV and auth tag
     */
    static encrypt(plaintext: string): string;
    /**
     * Decrypt encrypted data
     */
    static decrypt(encryptedData: string): string;
    /**
     * Hash sensitive data (one-way)
     * Useful for storing data that needs to be verified but not retrieved
     */
    static hash(data: string): string;
    /**
     * Verify hashed data
     */
    static verifyHash(data: string, hashedData: string): boolean;
    /**
     * Generate a secure random token
     */
    static generateToken(length?: number): string;
    /**
     * Generate a secure random string (alphanumeric)
     */
    static generateRandomString(length?: number): string;
    /**
     * Hash a password with bcrypt-like security
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Verify a password hash
     */
    static verifyPassword(password: string, hash: string): Promise<boolean>;
    /**
     * Encrypt an object (converts to JSON first)
     */
    static encryptObject(obj: any): string;
    /**
     * Decrypt an encrypted object
     */
    static decryptObject<T>(encryptedData: string): T;
    /**
     * Mask sensitive data for logging (show first/last few characters)
     */
    static maskSensitive(data: string, visibleChars?: number): string;
    /**
     * Generate encryption key (for initial setup)
     */
    static generateEncryptionKey(): string;
}
//# sourceMappingURL=encryptionService.d.ts.map