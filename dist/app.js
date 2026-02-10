"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = __importDefault(require("./config"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Security middleware with relaxed CSP for images
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP to allow cross-origin images
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: config_1.default.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Request logging
if (config_1.default.nodeEnv !== 'test') {
    app.use((0, morgan_1.default)(config_1.default.nodeEnv === 'development' ? 'dev' : 'combined'));
}
// Body parsing (except for Stripe webhook which needs raw body)
app.use((req, res, next) => {
    if (req.originalUrl === '/api/subscription/webhook') {
        next();
    }
    else {
        express_1.default.json({ limit: '10mb' })(req, res, next);
    }
});
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// API routes
app.use('/api', routes_1.default);
// Legal disclaimer endpoint
app.get('/api/disclaimer', (req, res) => {
    res.json({
        success: true,
        data: {
            disclaimer: 'This platform does not fabricate experience or guarantee hiring outcomes. AI-generated content is based solely on user-provided information.',
            lastUpdated: '2025-01-01',
        },
    });
});
// 404 handler
app.use(errorHandler_1.notFoundHandler);
// Error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map