"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enrollmentController_1 = require("../controllers/enrollmentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All enrollment routes require authentication
router.use(auth_1.authenticate);
router.post('/', enrollmentController_1.enrollCourse);
router.get('/', enrollmentController_1.getMyEnrollments);
router.get('/:id', enrollmentController_1.getEnrollmentById);
router.put('/:id/progress', enrollmentController_1.updateProgress);
router.delete('/:id', enrollmentController_1.cancelEnrollment);
exports.default = router;
//# sourceMappingURL=enrollmentRoutes.js.map