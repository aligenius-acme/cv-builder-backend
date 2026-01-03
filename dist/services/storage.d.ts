export interface UploadResult {
    key: string;
    url: string;
}
export declare function uploadFile(buffer: Buffer, fileName: string, userId: string, folder?: string, contentType?: string): Promise<UploadResult>;
export declare function getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
export declare function getFile(key: string): Promise<Buffer>;
export declare function deleteFile(key: string): Promise<void>;
export declare function uploadDocument(buffer: Buffer, userId: string, type: 'pdf' | 'docx', prefix?: string): Promise<UploadResult>;
//# sourceMappingURL=storage.d.ts.map