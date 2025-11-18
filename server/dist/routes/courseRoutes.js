"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', courseController_1.getCourses);
router.get('/featured', courseController_1.getFeaturedCourses);
router.get('/:id', courseController_1.getCourseById);
// Protected routes
router.get('/:id/check-enrollment', auth_1.authenticate, courseController_1.checkEnrollment);
// Admin routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), courseController_1.createCourse);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), courseController_1.updateCourse);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), courseController_1.deleteCourse);
exports.default = router;
//# sourceMappingURL=courseRoutes.js.map