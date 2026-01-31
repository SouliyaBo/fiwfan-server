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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env vars
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
const checkKyc = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Connecting to DB...");
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is missing from env");
        }
        yield mongoose_1.default.connect(process.env.DATABASE_URL);
        console.log("Connected.");
        // We need to import the model or define a temporary schema
        // Defining temp schema to avoid import issues with relative paths if run from root
        const CreatorSchema = new mongoose_1.default.Schema({
            displayName: String,
            verificationStatus: String,
            user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }
        });
        // Use existing model if possible, or create a temp one attached to 'creators' collection
        const Creator = mongoose_1.default.models.Creator || mongoose_1.default.model('Creator', CreatorSchema, 'creators');
        const User = mongoose_1.default.models.User || mongoose_1.default.model('User', new mongoose_1.default.Schema({ username: String, email: String }), 'users');
        const pendingCreators = yield Creator.find({ verificationStatus: 'PENDING' }).populate('user');
        console.log(`Found ${pendingCreators.length} creators with PENDING status.`);
        pendingCreators.forEach(c => {
            var _a, _b;
            // @ts-ignore
            const username = ((_a = c.user) === null || _a === void 0 ? void 0 : _a.username) || ((_b = c.user) === null || _b === void 0 ? void 0 : _b.email) || "Unknown User";
            console.log(`- Creator: ${c.displayName} (User: ${username}) | Status: ${c.verificationStatus}`);
        });
        yield mongoose_1.default.disconnect();
        console.log("Done.");
    }
    catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
});
checkKyc();
