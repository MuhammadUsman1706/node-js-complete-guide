const Product = require("../models/product");

// For app.js routes
exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }

  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req?.session?.isLoggedIn,
    // productCSS: true,
    // formsCSS: true,
    // activeAddProduct: true,
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  // Could also user req.user._id
  const userId = req.user;

  // Mongoose takes an object of required/defined parameters
  const product = new Product({ title, price, description, imageUrl, userId });

  // Mongoose has a save method built in
  await product.save();

  res.redirect("/admin/products");
};

exports.postDeleteProduct = async (req, res, next) => {
  const productId = req.body.productId;
  await Product.deleteOne({ _id: productId });
  res.redirect("/admin/products");
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit; // This returns "true" not true
  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  if (!product) {
    return res.redirect("/");
  }

  res.render("admin/edit-product", {
    pageTitle: "Edit Product",
    path: "/admin/edit-product",
    editing: editMode,
    product,
    isAuthenticated: req?.session?.isLoggedIn,
    // productCSS: true,
    // formsCSS: true,
    // activeAddProduct: true,
  });
};

exports.postEditProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const product = await Product.findById(prodId);

  product.title = req.body.title;
  product.price = req.body.price;
  product.description = req.body.description;
  product.imageUrl = req.body.imageUrl;

  await product.save();
  res.redirect("/admin/products");
};

exports.getProducts = async (req, res, next) => {
  const products = await Product.find();
  // .select("title price -_id") // to fetch selected data from a query
  // .populate("userId", "name"); // to populates any "ref Object Id" with the actual data automatically! Second param is opt

  res.render("admin/products", {
    prods: products,
    pageTitle: "Admin Products",
    path: "/admin/products",
    isAuthenticated: req?.session?.isLoggedIn,
    // hasProducts: products.length > 0,
    // activeShop: true,
    // productCSS: true,
  });
};
