import { beforeEach, describe, jest } from "@jest/globals";

jest.mock("../../../config/redisClient.js", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    setEx: jest.fn(),
  },
}));

jest.mock("../../../models/order.js", () => {
  const mockOrder = jest.fn().mockImplementation(() => ({
    save: jest.fn(),
  }));

  mockOrder.find = jest.fn();
  mockOrder.findById = jest.fn();
  mockOrder.create = jest.fn();
  mockOrder.findByIdAndDelete = jest.fn();

  return {
    __esModule: true,
    default: mockOrder,
  };
});

jest.mock("../../../models/user.js", () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));

jest.mock("../../../services/paymentServices.js", () => ({
  PaymentService: jest.fn().mockImplementation(() => ({
    initializePayment: jest.fn(),
  })),
}));

import Order from "../../../models/order.js";
import User from "../../../models/user.js";
import { PaymentService } from "../../../services/paymentServices.js";
import {
  createOrder,
  getOrderById,
  deleteOrder,
  getOrders,
} from "../../../controllers/orderController.js";
import redisClient from "../../../config/redisClient.js";
import { __esModule } from "xss-clean/lib/xss.js";

describe("Order controller - unit test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new order and return payment URL", async () => {
    const req = {
      body: {
        products: [{ id: "prod1", quantity: 1, price: 1000 }],
        totalAmount: 1000,
        userId: "1234567",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    User.findById.mockResolvedValue({ email: "test@test.com" });

    const mockPaymentResult = {
      data: { authorization_url: "pay_url", reference: "ref123" },
    };

    PaymentService.mockImplementation(() => ({
      initializePayment: jest.fn().mockResolvedValue(mockPaymentResult),
    }));

    // ensure Order.save resolves
    Order.prototype.save = jest.fn().mockResolvedValue(true);

    await createOrder(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Order created successfully",
        paymentUrl: "pay_url",
        paymentReference: "ref123",
      })
    );
  });
});

describe("Get / get all others", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("get all others and return the values", async () => {
    
    redisClient.get.mockResolvedValue(null);
    const mockOrders = [
      {
        _id: "1",
        user: { _id: "u1", name: "Jonah", email: "jonah@test.com" },
        product: { _id: "p1", name: "Laptop", price: 2000 },
      },
    ];

    const req = {};

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockPopulate = jest.fn().mockResolvedValue(mockOrders);

    Order.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: mockPopulate,
      }),
    });

    await getOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(redisClient.setEx).toHaveBeenCalledWith(
      "orders",
      600,
      JSON.stringify(mockOrders)
    );
    
  });
});
