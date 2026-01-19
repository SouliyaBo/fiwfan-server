"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const setting_controller_1 = require("../controllers/setting.controller");
const router = express_1.default.Router();
router.get('/locations', setting_controller_1.getLocations);
router.get('/', setting_controller_1.getSettings);
router.post('/', setting_controller_1.updateSetting); // Use POST to create/update
router.put('/', setting_controller_1.updateSetting);
exports.default = router;
