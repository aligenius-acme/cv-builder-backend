"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const subscription_1 = require("../middleware/subscription");
const coverLetter_1 = require("../controllers/coverLetter");
const router = (0, express_1.Router)();
// All routes require authentication and Pro subscription
router.use(auth_1.authenticate);
router.use(subscription_1.checkCoverLetterAccess);
// Cover letter operations
router.post('/', coverLetter_1.generateCoverLetter);
router.get('/', coverLetter_1.getCoverLetters);
router.get('/:id', coverLetter_1.getCoverLetter);
router.put('/:id', coverLetter_1.updateCoverLetter);
router.delete('/:id', coverLetter_1.deleteCoverLetter);
router.get('/:id/download', coverLetter_1.downloadCoverLetter);
router.post('/:id/regenerate', coverLetter_1.regenerateCoverLetter);
exports.default = router;
//# sourceMappingURL=coverLetter.js.map