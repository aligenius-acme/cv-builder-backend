import { ParsedResumeData } from '../types';
export declare function parseFile(buffer: Buffer, fileName: string): Promise<string>;
export declare function extractResumeData(rawText: string): ParsedResumeData;
export declare function logParsingError(fileName: string, fileType: string, error: Error, resumeId?: string, userId?: string): Promise<void>;
//# sourceMappingURL=parser.d.ts.map