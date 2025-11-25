"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const noteController_1 = require("../controllers/noteController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All routes are protected
router.use(authMiddleware_1.protect);
router.route('/')
    .get(noteController_1.getNotes)
    .post(noteController_1.createNote);
router.get('/search', noteController_1.searchNotes);
router.route('/:id')
    .get(noteController_1.getNoteById)
    .put(noteController_1.updateNote)
    .delete(noteController_1.deleteNote);
exports.default = router;
//# sourceMappingURL=noteRoutes.js.map