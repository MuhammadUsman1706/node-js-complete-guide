// There can be one-to-one relation between controller and routing files. But we can also split the files acccording to the routes we have inside the files, and thats what we're doing here.

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

const ITEMS_PER_PAGE = 2;

// For shop.js routes
exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || 1;
  const numberOfProducts = Product.find().countDocuments();

  // skipping all products of previous pages and then limit data to per page items to not get further data of pages ahead
  const products = Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  const promiseResolution = await Promise.all([numberOfProducts, products]);

  return res.render("shop/product-list", {
    prods: promiseResolution[1],
    pageTitle: "Products",
    path: "/products",
    totalProducts: promiseResolution[0],
    hasNextPage: promiseResolution[0] > page * ITEMS_PER_PAGE,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    currentPage: page,
    lastPage: Math.ceil(promiseResolution[0] / ITEMS_PER_PAGE),
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
  const page = +req.query.page || 1;
  const numberOfProducts = Product.find().countDocuments();

  // skipping all products of previous pages and then limit data to per page items to not get further data of pages ahead
  const products = Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  const promiseResolution = await Promise.all([numberOfProducts, products]);

  return res.render("shop/index", {
    prods: promiseResolution[1],
    pageTitle: "Shop",
    path: "/",
    totalProducts: promiseResolution[0],
    hasNextPage: promiseResolution[0] > page * ITEMS_PER_PAGE,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    currentPage: page,
    lastPage: Math.ceil(promiseResolution[0] / ITEMS_PER_PAGE),
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

exports.getCheckout = async (req, res, next) => {
  const {
    cart: { items: products },
  } = await User.findOne(req.user._id)
    .select("cart")
    .populate("cart.items.productId");

  let totalSum = 0;

  products.forEach((product) => {
    totalSum += product.quantity * product.productId.price;
  });

  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
    products,
    totalSum,
  });
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

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;

  // To check whether the order belongs to the user (security)
  const orderDetails = await Order.findById(orderId);
  if (!orderDetails) return new Error("No order found.");

  if (orderDetails.user.userId.toString() !== req.user._id.toString())
    return next();

  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = path.join("data", "invoices", invoiceName);

  const pdfDoc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename='${invoiceName}'`);

  // After pipe, whatever we add in the PDF, gets forwarded into our drive/server as well the response
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);

  pdfDoc.fontSize(26).text("Invoice", { underline: true });
  pdfDoc.text("------------------------------");
  let totalPrice = 0;
  orderDetails.products.map((prod) => {
    totalPrice += prod.quantity * prod.productId.price;
    pdfDoc
      .fontSize(14)
      .text(
        `${prod.productId.title} - ${prod.quantity} x $${prod.productId.price}`
      );
    pdfDoc.text("---");
    pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);
  });
  pdfDoc.end();

  // In fs.readFile, node reads the whole file wasting the memory, while in stream a chunk is read and sent. Which is faster and lighter on mem.
  // const file = fs.createReadStream(invoicePath);
  // file.pipe(res);
};
