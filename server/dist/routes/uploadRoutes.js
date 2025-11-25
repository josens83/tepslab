"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Placeholder upload routes
router.post('/image', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'File upload not yet implemented',
    });
});
router.post('/video', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Video upload not yet implemented',
    });
});
router.delete('/:filename', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'File deletion not yet implemented',
    });
});
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map