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
const database_1 = __importDefault(require("../configs/database"));
const agency_model_1 = __importDefault(require("../app/models/agency.model"));
const creator_model_1 = __importDefault(require("../app/models/creator.model"));
dotenv_1.default.config();
const seedAgencies = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, database_1.default)();
        console.log("Connected to DB");
        // 1. Create Sample Agency
        const agencyName = "SuperModel Agency";
        let agency = yield agency_model_1.default.findOne({ name: agencyName });
        if (!agency) {
            agency = yield agency_model_1.default.create({
                name: agencyName,
                description: "Top tier models in Bangkok",
                location: "Bangkok",
                logoUrl: "" // Optional
            });
            console.log("Created Agency:", agency.name);
        }
        else {
            console.log("Agency exists:", agency.name);
        }
        // 2. Assign some creators to this agency
        // Find creators who don't have an agency yet
        const creators = yield creator_model_1.default.find({ agency: { $exists: false } }).limit(5);
        if (creators.length === 0) {
            console.log("No available creators to assign.");
        }
        else {
            const creatorIds = creators.map((c) => c._id);
            yield creator_model_1.default.updateMany({ _id: { $in: creatorIds } }, { $set: { agency: agency === null || agency === void 0 ? void 0 : agency._id } });
            console.log(`Assigned ${creators.length} creators to ${agency === null || agency === void 0 ? void 0 : agency.name}`);
        }
        process.exit(0);
    }
    catch (error) {
        console.error("Error seeding agencies:", error);
        process.exit(1);
    }
});
seedAgencies();
