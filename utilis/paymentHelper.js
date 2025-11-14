import axios from 'axios';
import { PAYSTACK_SECRET_KEY } from '../config/paystack.js';
import dotenv from 'dotenv';

dotenv.config();

export const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});
