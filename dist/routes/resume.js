"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const subscription_1 = require("../middleware/subscription");
const resume_1 = require("../controllers/resume");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/webp',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF, DOCX, and image files (JPG, PNG, WebP) are allowed'));
        }
    },
});
// All routes require authentication
router.use(auth_1.authenticate);
// Resume CRUD
router.post('/', subscription_1.checkResumeQuota, upload.single('file'), resume_1.uploadResume);
router.get('/', resume_1.getResumes);
router.get('/:id', resume_1.getResume);
router.put('/:id', resume_1.updateResume);
router.delete('/:id', resume_1.deleteResume);
// Resume Builder
router.post('/create', subscription_1.checkResumeQuota, resume_1.createBlankResume);
router.put('/:id/content', resume_1.updateResumeContent);
router.get('/:id/download', resume_1.downloadResume);
router.get('/:id/preview', resume_1.previewResume);
// Resume customization
router.post('/:id/customize', resume_1.customizeResume);
// Job URL scraping
router.post('/scrape-job', resume_1.scrapeJobUrl);
// Version operations
router.get('/:id/versions/:versionId', resume_1.getVersion);
router.get('/:id/compare', resume_1.compareVersions);
router.get('/:id/versions/:versionId/download', resume_1.downloadVersion);
// ATS simulation (Pro feature)
router.post('/:id/versions/:versionId/simulate-ats', subscription_1.checkATSSimulatorAccess, resume_1.simulateATS);
exports.default = router;
//# sourceMappingURL=resume.js.map