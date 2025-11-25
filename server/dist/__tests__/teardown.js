"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
module.exports = async () => {
    // Close mongoose connection
    await mongoose_1.default.disconnect();
    // Stop MongoDB server
    const mongoServer = global.__MONGO_SERVER__;
    if (mongoServer) {
        await mongoServer.stop();
    }
};
//# sourceMappingURL=teardown.js.map