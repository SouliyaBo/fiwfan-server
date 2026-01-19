"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const story_controller_1 = require("../controllers/story.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', story_controller_1.getStories); // Public feed of stories? Or protected? Let's make it public for now or verifyToken if needed.
// Actually, usually viewing stories might require login depending on app logic. Let's leave it open but frontend can enforce.
// To keep it simple:
router.get('/feed', story_controller_1.getStories);
router.post('/', auth_middleware_1.authenticate, story_controller_1.createStory);
router.get('/me', auth_middleware_1.authenticate, story_controller_1.getMyStories);
router.delete('/:id', auth_middleware_1.authenticate, story_controller_1.deleteStory);
exports.default = router;
