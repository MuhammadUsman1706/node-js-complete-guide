// There can be one-to-one relation between controller and routing files. But we can also split the files acccording to the routes we have inside the files, and thats what we're doing here.

// const products = [];
const Product = require("../models/product");

// For shop.js routes
exports.getProducts = async (req, res, next) => {
  const products = await Product.find();

  res.render("shop/product-list", {
    prods: products,
    pageTitle: "Shop",
    path: "/",
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true,
    isAuthenticated: req?.session?.isLoggedIn,
  });
};

// For app.js routes
exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    productCSS: true,
    formsCSS: true,
    activeAddProduct: true,
    isAuthenticated: req?.session?.isLoggedIn,
  });
};

exports.postAddProduct = (req, res, next) => {
  // products.push({ title: req.body.title });
  const product = new Product(req.body.title);
  product.save();
  res.redirect("/");
};
