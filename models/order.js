const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  products: [
    {
      productId: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
});

module.exports = model("Order", orderSchema);

// My try
// const orderSchema = new Schema({
//   userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//   orders: [
//     {
//       items: [
//         {
//           productId: {
//             type: Schema.Types.ObjectId,
//             ref: "Product",
//             required: true,
//           },
//           quantity: { type: Number, required: true },
//         },
//       ],
//     },
//   ],
// });
