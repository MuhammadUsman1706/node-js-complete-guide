// There can be one-to-one relation between controller and routing files. But we can also split the files acccording to the routes we have inside the files, and thats what we're doing here.

const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

// For shop.js routes
exports.getProducts = async (req, res, next) => {
  const products = await Product.find();
  res.render("shop/product-list", {
    prods: products,
    pageTitle: "All Products",
    path: "/products",
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true,
    isAuthenticated: req?.session?.isLoggedIn,
  });
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  res.render("shop/product-detail", {
    pageTitle: product.title,
    path: "/products",
    product: product,
    isAuthenticated: req?.session?.isLoggedIn,
  });
};

exports.getIndex = async (req, res, next) => {
  const products = await Product.find();
  res.render("shop/index", {
    prods: products,
    pageTitle: "Shop",
    path: "/",
  });
};

exports.getCart = async (req, res, next) => {
  const { cart } = await User.findOne(req.user._id)
    .select("cart")
    .populate("cart.items.productId");

  res.render("shop/cart", {
    pageTitle: "Your Cart",
    path: "/cart",
    products: cart.items,
    isAuthenticated: req?.session?.isLoggedIn,
  });
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  const product = await Product.findById(prodId);
  await req.user.addToCart(product);
  res.redirect("/cart");
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  await req.user.deleteItemFromCart(prodId);
  res.redirect("/cart");
};

exports.postOrder = async (req, res, next) => {
  const userId = req.user._id;
  const email = req.user.email;
  const {
    cart: { items: products },
  } = await User.findOne(req.user._id)
    .select("cart")
    .populate("cart.items.productId");

  const order = new Order({ products, user: { userId, email } });

  await order.save();
  await req.user.clearCart();

  res.redirect("/orders");
};

exports.getOrders = async (req, res, next) => {
  const orders = await Order.find({ "user.userId": req.user }, "products");
  // console.log(orders[0].products);
  res.render("shop/orders", {
    pageTitle: "Your Orders",
    path: "/orders",
    orders,
    isAuthenticated: req?.session?.isLoggedIn,
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
    isAuthenticated: req?.session?.isLoggedIn,
  });
};
