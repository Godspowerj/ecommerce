import { PaymentService } from "../services/paymentServices.js";
import Order from "../models/order.js";

const paymentService = new PaymentService();

export const initializePayment = async (req, res) => {
  try {
    const { email, amount, reference } = req.body;
    const result = await paymentService.initializePayment(
      email,
      amount,
      reference
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params; // Reference from Paystack

    // Verify payment from Paystack
    const result = await paymentService.verifyPayment(reference);

    // Check Paystack response
    if (result.data.status === "success") {
      // Update the order’s payment status to completed
      const order = await Order.findOneAndUpdate(
        { paymentReference: reference },
        { paymentStatus: "completed", status: "delivered" },
        { new: true }
      );

      if (!order) {
        return res
          .status(404)
          .json({ message: "Order not found for this reference" });
      }


      return res.status(200).json({
        message: "Payment verified successfully",
        order,
        transaction: result.data,
      });
    } else {
      // Update as failed
      await Order.findOneAndUpdate(
        { paymentReference: reference },
        { paymentStatus: "failed" },
        { new: true }
      );

      return res.status(400).json({ message: "Payment failed or incomplete" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// export const paystackWebhook = async (req, res) => {
//   try {
//     const event = req.body;
//     // Paystack sends event data in the request body

//     if (event.event === "charge.success") {
//       const reference = event.data.reference;
//       // Get the payment reference from the event

//       // Update the order status automatically
//       const order = await Order.findOneAndUpdate(
//         { paymentReference: reference },
//         { paymentStatus: "completed", status: "delivered" },
//         { new: true }
//       );

//       if (order) {
//         return res.status(200).json({ message: "Order updated via webhook" });
//       } else {
//         return res.status(404).json({ message: "Order not found for reference" });
//       }
//     }

//     // Handle other events if needed
//     res.status(200).json({ message: "Webhook received" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
