"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookmarkController_1 = require("../controllers/bookmarkController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All routes are protected
router.use(authMiddleware_1.protect);
router.route('/')
    .get(bookmarkController_1.getBookmarks)
    .post(bookmarkController_1.createBookmark);
router.route('/:id')
    .get(bookmarkController_1.getBookmarkById)
    .put(bookmarkController_1.updateBookmark)
    .delete(bookmarkController_1.deleteBookmark);
router.delete('/course/:courseId', bookmarkController_1.deleteBookmarksByCourse);
exports.default = router;
//# sourceMappingURL=bookmarkRoutes.js.map