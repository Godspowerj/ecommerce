import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, min: 0 },

    image: {
      url: {
        type: String,
        default: "https://via.placeholder.com/500x500.png?text=No+Image",
      },
      public_id: { type: String, default: "" },
    },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" , required:true},
  },
  { timestamps: true }
);
const productDetails = mongoose.model("Product", productSchema);

export default productDetails;
