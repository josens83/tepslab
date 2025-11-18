"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// 모든 라우트는 인증 필요
router.use(auth_1.authenticate);
// 결제 준비
router.post('/ready', paymentController_1.preparePayment);
// 결제 승인
router.post('/confirm', paymentController_1.confirmPayment);
// 결제 내역 조회
router.get('/', paymentController_1.getPayments);
// 결제 상세 조회
router.get('/:id', paymentController_1.getPaymentById);
// 결제 취소/환불
router.post('/:id/cancel', paymentController_1.cancelPayment);
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map