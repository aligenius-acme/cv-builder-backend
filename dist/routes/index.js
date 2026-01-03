"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const resume_1 = __importDefault(require("./resume"));
const coverLetter_1 = __importDefault(require("./coverLetter"));
const subscription_1 = __importDefault(require("./subscription"));
const admin_1 = __importDefault(require("./admin"));
const router = (0, express_1.Router)();
// API routes
router.use('/auth', auth_1.default);
router.use('/resumes', resume_1.default);
router.use('/cover-letters', coverLetter_1.default);
router.use('/subscription', subscription_1.default);
router.use('/admin', admin_1.default);
// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map