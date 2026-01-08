import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const uploadResume: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getResumes: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getResume: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateResume: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteResume: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const customizeResume: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getVersion: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const compareVersions: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const downloadVersion: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const simulateATS: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const scrapeJobUrl: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createBlankResume: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateResumeContent: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const downloadResume: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const previewResume: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=resume.d.ts.map