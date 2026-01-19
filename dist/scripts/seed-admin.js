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
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("../configs/database")); // Use the shared config
const user_model_1 = __importDefault(require("../app/models/user.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, database_1.default)();
        console.log('Connected to MongoDB');
        const existingAdmin = yield user_model_1.default.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin already exists');
        }
        else {
            const hashedPassword = yield bcrypt_1.default.hash('password123', 10);
            yield user_model_1.default.create({
                username: 'admin',
                email: 'admin@fiwfan.app',
                password: hashedPassword,
                displayName: 'Super Admin',
                role: 'ADMIN',
                isCreator: false
            });
            console.log('Admin user created: admin / password123');
        }
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
});
seedAdmin();
