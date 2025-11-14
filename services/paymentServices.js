import { paystack } from '../utilis/paymentHelper.js';

export class PaymentService {
  async initializePayment(email, amount, reference) {
    try {
      const response = await paystack.post('/transaction/initialize', {
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        reference,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment initialization failed');
    }
  }

   // Verify payment
  async verifyPayment(reference) {
    try {
      const response = await paystack.get(`/transaction/verify/${reference}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Payment verification failed");
    }
  }
}



