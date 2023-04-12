const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  products: [
    {
      productId: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    email: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
});

module.exports = model("Order", orderSchema);
