"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getAdminProfile = exports.deleteAdmin = exports.updateAdminPermissions = exports.getAllAdmins = exports.createAdmin = void 0;
const user_model_1 = __importStar(require("../models/user.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, permissions, displayName } = req.body;
        // Check if username exists
        const existingUser = yield user_model_1.default.findOne({ username });
        if (existingUser) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newAdmin = new user_model_1.default({
            username,
            password: hashedPassword,
            displayName: displayName || username,
            role: user_model_1.Role.ADMIN,
            permissions: permissions || [],
            email: `${username}@admin.local` // Dummy email for admin
        });
        yield newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
    }
    catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createAdmin = createAdmin;
const getAllAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield user_model_1.default.find({ role: user_model_1.Role.ADMIN }).select('-password');
        res.status(200).json(admins);
    }
    catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getAllAdmins = getAllAdmins;
const updateAdminPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { permissions } = req.body;
        const admin = yield user_model_1.default.findById(id);
        if (!admin) {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }
        if (admin.role !== user_model_1.Role.ADMIN) {
            res.status(400).json({ error: 'User is not an admin' });
            return;
        }
        admin.permissions = permissions;
        yield admin.save();
        res.status(200).json({ message: 'Permissions updated successfully', admin });
    }
    catch (error) {
        console.error('Error updating permissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateAdminPermissions = updateAdminPermissions;
const deleteAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const admin = yield user_model_1.default.findByIdAndDelete(id);
        if (!admin) {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }
        res.status(200).json({ message: 'Admin deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteAdmin = deleteAdmin;
const getAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield user_model_1.default.findById(req.user.id).select('-password');
        if (!admin) {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }
        res.status(200).json(admin);
    }
    catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getAdminProfile = getAdminProfile;
