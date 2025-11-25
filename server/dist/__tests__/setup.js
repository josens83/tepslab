"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongoServer;
module.exports = async () => {
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
    process.env.NODE_ENV = 'test';
    // Store mongoServer instance globally
    global.__MONGO_SERVER__ = mongoServer;
};
//# sourceMappingURL=setup.js.map