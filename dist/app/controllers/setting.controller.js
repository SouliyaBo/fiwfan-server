"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSetting = exports.getSettings = exports.getLocations = void 0;
const setting_model_1 = __importDefault(require("../models/setting.model"));
const locations_1 = require("../data/locations");
// Get available locations
const getLocations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { country } = req.query;
    // If country code is provided, return provinces for that country
    if (country) {
        const selectedCountry = locations_1.COUNTRIES.find(c => c.code === country.toUpperCase());
        return res.json(selectedCountry ? selectedCountry.provinces : []);
    }
    // Default: Return list of countries with their data
    // Or if you want to maintain backward compatibility for a while, you could return flat list if no param?
    // But for this feature, let's return the full hierarchy structure or just countries list
    res.json(locations_1.COUNTRIES);
});
exports.getLocations = getLocations;
// Get all settings (or specific one by query)
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.query;
        if (key) {
            const setting = yield setting_model_1.default.findOne({ key: key });
            return res.json(setting || { key, value: null });
        }
        const settings = yield setting_model_1.default.find({});
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSettings = getSettings;
// Update or Create a setting
const updateSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, value, description } = req.body;
        if (!key) {
            return res.status(400).json({ message: 'Key is required' });
        }
        const setting = yield setting_model_1.default.findOneAndUpdate({ key }, { value, description }, { new: true, upsert: true } // Create if not exists
        );
        res.json(setting);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateSetting = updateSetting;
