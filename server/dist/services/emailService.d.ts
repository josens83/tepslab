interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
/**
 * Send email
 */
export declare const sendEmail: (options: EmailOptions) => Promise<boolean>;
/**
 * Email Templates
 */
export declare const getWelcomeEmailTemplate: (name: string) => string;
export declare const getPasswordResetEmailTemplate: (name: string, resetUrl: string) => string;
export declare const getPaymentConfirmationEmailTemplate: (name: string, courseTitle: string, amount: number, orderId: string) => string;
export declare const getEmailVerificationTemplate: (name: string, verifyUrl: string) => string;
export {};
//# sourceMappingURL=emailService.d.ts.map