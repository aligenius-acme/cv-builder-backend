export declare const config: {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
    databaseUrl: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
        proPriceId: string;
        businessPriceId: string;
    };
    ai: {
        groqApiKey: string;
        groqModel: string;
    };
    adzuna: {
        appId: string;
        appKey: string;
        baseUrl: string;
    };
    oauth: {
        google: {
            clientId: string;
            clientSecret: string;
            redirectUri: string;
        };
        github: {
            clientId: string;
            clientSecret: string;
            redirectUri: string;
        };
    };
    email: {
        sendgridApiKey: string;
        fromEmail: string;
        fromName: string;
    };
    sentry: {
        dsn: string;
        release: string;
    };
    encryptionKey: string;
};
export default config;
//# sourceMappingURL=index.d.ts.map