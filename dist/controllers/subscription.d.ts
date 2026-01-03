import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getSubscription: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createCheckout: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createPortal: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cancel: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const reactivate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const webhook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPlans: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUsage: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=subscription.d.ts.map