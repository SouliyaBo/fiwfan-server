"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/', auth_middleware_1.authenticate, report_controller_1.createReport);
router.get('/', auth_middleware_1.authenticate, report_controller_1.getReports);
router.patch('/:id', auth_middleware_1.authenticate, report_controller_1.updateReportStatus);
exports.default = router;
