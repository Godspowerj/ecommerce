import { expect, it, jest } from "@jest/globals";

jest.mock("../../services/sendEmail", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("../../models/user.js", () => ({
  __esModule: true, // ✅ tells Jest it's an ES module
  default: {
    // ✅ your module exports `default`
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hashSync: jest.fn(() => "hashedPassword123"),
  compareSync: jest.fn(
    (password, hashed) =>
      password === "validPassword" && hashed === "hashedPassword123"
  ),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked-jwt-token"),
}));

import { sendEmail } from "../../services/sendEmail";
import supertest from "supertest";
import { app } from "../../app";
import usersDetails from "../../models/user";
import jwt from "jsonwebtoken";

const required = supertest(app);

describe("POST /auth/signupcontroller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new user", async () => {
    usersDetails.findOne.mockResolvedValue(null);
    usersDetails.create.mockResolvedValueOnce({
      id: "123",
      email: "test@test.com",
    });

    const res = await required.post("/auth/signup").send({
      username: "purity",
      email: "test@test.com",
      password: "123245667",
      role: "admin",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body).toHaveProperty("token");

    expect(sendEmail).toHaveBeenCalled();

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "test@test.com" })
    );

    expect(jwt.sign).toHaveBeenCalled();
    expect(res.body.token).toBe("mocked-jwt-token");
  });

  it("should return 400 for non-existing user", async () => {
    const res = await required.post("/auth/login").send({
      username: "ghostUser",
      password: "12345678",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid username or password");
  });
});


//test login controller 
describe("POST /auth/logincontroller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login an existing user", async () => {
    usersDetails.findOne.mockResolvedValue({
      _id: "123",
      username: "purity",
      password: "hashedPassword123",
      role: "admin",
      email: "test@test2.com",
    });
    const res = await required.post("/auth/login").send({
      username: "purity",
      password: "validPassword",
    });

    expect(sendEmail).not.toHaveBeenCalled();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Login successful");
    expect(res.body).toHaveProperty("token");
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.body.token).toBe("mocked-jwt-token");

  });

  it("should return 401 for invalid password", async () => {
    usersDetails.findOne.mockResolvedValue({
      _id: "123",
      username: "purity",
      password: "hashedPassword123",
      role: "admin",
      email: ""
    });

    const res = await required.post("/auth/login").send({
      username: "purity",
      password: "wrongPassword",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid password");
  });
});

describe("POST /auth/resetPasswordController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should change existing user's password", async () => {
    usersDetails.findOne.mockResolvedValue({
      _id: "123",
      username: "purity",
      password: "hashedPassword123",
      role: "admin",
      email: "test@test3.com",
      save: jest.fn().mockResolvedValue(true),
    });

    const res = await required.post("/auth/reset-password").send({
      email: "test@test3.com",
      newPassword: "newsecurePassword",
    })

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Password reset successful");
    expect(sendEmail).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "test@test3.com" })
    );
  });

  it("should return 404 for non-existing user", async () => {
    usersDetails.findOne.mockResolvedValue(null);
    const res = await required.post("/auth/reset-password").send({
      email: "test@testfake.com",
      newPassword: "newsecurePassword",
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "User not found");
  });

});

