import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getDashboard: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUsers: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrganizations: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAIUsage: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getParsingErrors: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAuditLogs: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPrompts: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updatePrompt: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createTemplate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTemplates: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=admin.d.ts.map