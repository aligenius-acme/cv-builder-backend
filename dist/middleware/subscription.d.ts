import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, SubscriptionLimits } from '../types';
import { PlanType } from '@prisma/client';
export declare const getSubscriptionLimits: (planType: PlanType) => SubscriptionLimits;
export declare const requireActiveSubscription: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireProPlan: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkResumeQuota: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkCoverLetterAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkATSSimulatorAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkAnonymizationAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const trackAIUsage: (userId: string, organizationId: string | null | undefined, operation: string, provider: string, model: string, promptTokens: number, completionTokens: number, durationMs: number, success?: boolean, errorMessage?: string) => Promise<void>;
//# sourceMappingURL=subscription.d.ts.map