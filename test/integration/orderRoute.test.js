import { beforeEach, jest } from "@jest/globals";


jest.mock("../../config/redisClient.js", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    setEx: jest.fn(),
  },
}));

jest.mock("../../services/paymentServices.js", () => ({
  __esModule: true,
  PaymentService: jest.fn().mockImplementation(() => ({
    initializePayment: jest.fn(),
  })),
}));

import { app } from "../../app.js";
import { PaymentService } from "../../services/paymentServices.js";
import Order from "../../models/order.js";
import User from "../../models/user.js";
import supertest from "supertest";


const request = supertest(app);

describe("Orders API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /orders", () => {
    it("should create a new order and return payment URL", async () => {
      const newOrder = {
        userId: "user1",
        products: [{ price: 100, quantity: 2 }],
        totalAmount: 200,
      };


      // Mock payment service response
      const mockPaymentResult = { data: { authorization_url: "pay_url", reference: "ref123" } };

      // Mock PaymentService 
      PaymentService.mockImplementation(() => ({
        initializePayment: jest.fn().mockResolvedValue(mockPaymentResult),
      }));

      // Mock Order save
      Order.prototype.save = jest.fn().mockResolvedValue(true);

      // Mock User.findById to return a valid user object
      User.findById = jest.fn().mockResolvedValue({ _id: "user1", email: "test@test.com" });

      const res = await request.post("/orders/create").send(newOrder);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("order");
      expect(res.body).toHaveProperty("paymentUrl", "pay_url");
      expect(res.body).toHaveProperty("paymentReference", "ref123");
      
    });

    it("should return 400 if totalAmount mismatch", async () => {
      const newOrder = {
        userId: "user1",
        products: [{ price: 100, quantity: 4 }],
        totalAmount: 500,
      };

      User.findById = jest.fn().mockResolvedValue({ email: "test@test.com" });

      const res = await request.post("/orders/create").send(newOrder);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Total amount mismatch");
    });
    
  });

});
