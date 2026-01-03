export declare const config: {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
    databaseUrl: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        s3Bucket: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
        proPriceId: string;
        businessPriceId: string;
    };
    ai: {
        provider: string;
        openaiApiKey: string;
        anthropicApiKey: string;
    };
    encryptionKey: string;
};
export default config;
//# sourceMappingURL=index.d.ts.map