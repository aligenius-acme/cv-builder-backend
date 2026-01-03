"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const subscription_1 = require("../controllers/subscription");
const router = (0, express_1.Router)();
// Stripe webhook (needs raw body)
router.post('/webhook', express_2.default.raw({ type: 'application/json' }), subscription_1.webhook);
// Public routes
router.get('/plans', subscription_1.getPlans);
// Protected routes
router.get('/', auth_1.authenticate, subscription_1.getSubscription);
router.post('/checkout', auth_1.authenticate, subscription_1.createCheckout);
router.post('/portal', auth_1.authenticate, subscription_1.createPortal);
router.post('/cancel', auth_1.authenticate, subscription_1.cancel);
router.post('/reactivate', auth_1.authenticate, subscription_1.reactivate);
router.get('/usage', auth_1.authenticate, subscription_1.getUsage);
exports.default = router;
//# sourceMappingURL=subscription.js.map