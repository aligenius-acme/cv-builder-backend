"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../controllers/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', auth_2.register);
router.post('/login', auth_2.login);
router.post('/forgot-password', auth_2.forgotPassword);
router.post('/reset-password', auth_2.resetPassword);
// Protected routes
router.get('/me', auth_1.authenticate, auth_2.me);
router.put('/profile', auth_1.authenticate, auth_2.updateProfile);
router.put('/change-password', auth_1.authenticate, auth_2.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map