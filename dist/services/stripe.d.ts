import { PlanType, SubscriptionStatus } from '@prisma/client';
export declare function createCustomer(userId: string, email: string, name?: string): Promise<string>;
export declare function createCheckoutSession(userId: string, planType: 'pro' | 'business', successUrl: string, cancelUrl: string): Promise<string>;
export declare function createPortalSession(userId: string, returnUrl: string): Promise<string>;
export declare function handleWebhookEvent(payload: Buffer, signature: string): Promise<void>;
export declare function cancelSubscription(userId: string): Promise<void>;
export declare function reactivateSubscription(userId: string): Promise<void>;
export declare function getSubscriptionInfo(userId: string): Promise<{
    planType: PlanType;
    status: SubscriptionStatus;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd: boolean;
}>;
export declare function createOrgCheckoutSession(organizationId: string, seats: number, successUrl: string, cancelUrl: string): Promise<string>;
//# sourceMappingURL=stripe.d.ts.map