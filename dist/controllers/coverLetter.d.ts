import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const generateCoverLetter: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCoverLetters: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCoverLetter: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCoverLetter: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCoverLetter: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const downloadCoverLetter: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const regenerateCoverLetter: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=coverLetter.d.ts.map