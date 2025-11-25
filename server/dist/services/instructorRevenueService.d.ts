export declare class InstructorRevenueService {
    /**
     * Create revenue entry for instructor
     */
    static createRevenue(instructorId: string, courseId: string, enrollmentId: string, paymentId: string, totalAmount: number, sharePercentage?: number): Promise<any>;
    /**
     * Get instructor's total earnings
     */
    static getInstructorEarnings(instructorId: string): Promise<{
        totalEarnings: number;
        pendingEarnings: number;
        approvedEarnings: number;
        paidEarnings: number;
        availableForPayout: number;
    }>;
    /**
     * Get instructor's revenue by course
     */
    static getRevenueByCourse(instructorId: string): Promise<any[]>;
    /**
     * Approve revenue for payout
     */
    static approveRevenue(revenueIds: string[]): Promise<void>;
    /**
     * Create payout request
     */
    static createPayoutRequest(instructorId: string, amount: number, payoutMethod: 'bank_transfer' | 'paypal' | 'stripe', payoutDetails: any): Promise<any>;
    /**
     * Process payout request
     */
    static processPayoutRequest(requestId: string, adminId: string, approved: boolean, rejectionReason?: string): Promise<any>;
    /**
     * Get instructor's payout history
     */
    static getPayoutHistory(instructorId: string): Promise<any[]>;
    /**
     * Get instructor dashboard analytics
     */
    static getInstructorAnalytics(instructorId: string): Promise<any>;
    /**
     * Auto-approve revenues after holding period
     */
    static autoApproveRevenues(): Promise<void>;
}
//# sourceMappingURL=instructorRevenueService.d.ts.map