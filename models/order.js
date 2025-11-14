import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    product: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    totalAmount: { type: Number ,required:true},
    
    status: {
      type: String,
      enum: ["pending","delivered", "cancelled"],
      default: "pending",
    },

    paymentStatus:{
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },
    paymentReference:{type: String, required: true, unique: true}

  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
