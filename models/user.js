const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  // this.cart is still accessible since we will call this method on a populated instance of userSchema
  const cartProductIndex = this.cart.items.findIndex(
    (cp) => cp.productId.toString() === product._id.toString()
  );

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex > -1) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.deleteItemFromCart = function (prodId) {
  const updatedCartItems = this.cart.items.filter(
    (cartItem) => cartItem.productId.toString() !== prodId
  );
  this.cart.items = updatedCartItems;
  this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  this.save();
};

module.exports = model("User", userSchema);

///////////////////////////////////////////////
//////////////////////////////////////////////
// const { ObjectId } = require("mongodb");

// const getDb = require("../util/database").getDb;

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart; // {items:[]}
//     this._id = id;
//   }

//   async save() {
//     const db = getDb();
//     return await db.collection("users").insertOne(this);
//   }

//   async addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex(
//       (cp) => cp.productId.toString() === product._id.toString()
//     );
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex > -1) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }

//     const updatedCart = {
//       items: updatedCartItems,
//     };

//     const db = getDb();

//     return db.collection("users").updateOne(
//       { _id: new ObjectId(this._id) },
//       {
//         $set: {
//           cart: updatedCart,
//         },
//       }
//     );
//   }

//   async deleteItemFromCart(prodId) {
//     const updatedCartItems = this.cart.items.filter(
//       (cartItem) => cartItem.productId.toString() !== prodId.toString()
//     );

//     const db = getDb();
//     db.collection("users").updateOne(
//       { _id: new ObjectId(this._id) },
//       { $set: { cart: { items: updatedCartItems } } }
//     );
//   }

//   async getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map(
//       (cartProduct) => cartProduct.productId
//     );

//     // find all products that are in the cart
//     const products = await db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray();

//     // added by me
//     if (productIds.length !== products.length) {
//       this.resetCart();
//       return { items: [] };
//     }

//     return products.map((product) => ({
//       ...product,
//       quantity: this.cart.items.find(
//         (cartItem) => cartItem.productId.toString() === product._id.toString()
//       ).quantity,
//     }));
//   }

//   // added by me
//   async resetCart() {
//     const db = getDb();

//     this.cart = { items: [] };
//     return await db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: { items: [] } } }
//       );
//   }

//   async addOrder() {
//     const db = getDb();
//     const products = await this.getCart();
//     const orders = {
//       items: products,
//       user: {
//         _id: new ObjectId(this._id),
//         name: this.name,
//       },
//     };

//     await db.collection("orders").insertOne(orders);

//     // this.cart = { items: [] };
//     // return await db
//     //   .collection("users")
//     //   .updateOne(
//     //     { _id: new ObjectId(this._id) },
//     //     { $set: { cart: { items: [] } } }
//     //   );

//     this.resetCart();
//   }

//   async getOrders() {
//     const db = getDb();
//     return await db
//       .collection("orders")
//       .find({ "user._id": new ObjectId(this._id) })
//       .toArray();
//   }

//   static async findById(id) {
//     const db = getDb();
//     const result = await db
//       .collection("users")
//       .findOne({ _id: new ObjectId(id) });
//     return result;
//   }
// }

// module.exports = User;
