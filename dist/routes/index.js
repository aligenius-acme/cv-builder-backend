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
const templates_1 = __importDefault(require("./templates"));
const organization_1 = __importDefault(require("./organization"));
const share_1 = __importDefault(require("./share"));
const aiWriting_1 = __importDefault(require("./aiWriting"));
const interviewPrep_1 = __importDefault(require("./interviewPrep"));
const salaryAnalyzer_1 = __importDefault(require("./salaryAnalyzer"));
const jobBoard_1 = __importDefault(require("./jobBoard"));
const jobTracker_1 = __importDefault(require("./jobTracker"));
const careerTools_1 = __importDefault(require("./careerTools"));
const abTesting_1 = __importDefault(require("./abTesting"));
const oauth_1 = __importDefault(require("./oauth"));
const grammar_1 = __importDefault(require("./grammar"));
const companyLogo_1 = __importDefault(require("./companyLogo"));
const aiFeatures_1 = __importDefault(require("./aiFeatures"));
const upload_1 = __importDefault(require("./upload"));
const router = (0, express_1.Router)();
// API routes
router.use('/auth', auth_1.default);
router.use('/resumes', resume_1.default);
router.use('/cover-letters', coverLetter_1.default);
router.use('/subscription', subscription_1.default);
router.use('/admin', admin_1.default);
router.use('/templates', templates_1.default);
router.use('/organization', organization_1.default);
router.use('/shared', share_1.default);
router.use('/ai-writing', aiWriting_1.default);
router.use('/interview-prep', interviewPrep_1.default);
router.use('/salary', salaryAnalyzer_1.default);
router.use('/jobs', jobBoard_1.default);
router.use('/job-tracker', jobTracker_1.default);
router.use('/career', careerTools_1.default);
router.use('/ab-tests', abTesting_1.default);
router.use('/oauth', oauth_1.default);
router.use('/grammar', grammar_1.default);
router.use('/company-logos', companyLogo_1.default);
router.use('/ai-features', aiFeatures_1.default);
router.use('/upload', upload_1.default);
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