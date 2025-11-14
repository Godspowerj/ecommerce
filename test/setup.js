import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import transporter from "../utilis/email";
import redisClient from "../config/redisClient";

let mongoServer; // <-- move this outside

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: "6.0.6" }, // smaller and faster to fetch
  });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    transporter.close?.();
    redisClient.quit();
  }
});
