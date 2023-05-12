const { validationResult } = require("express-validator");
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
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user; // can also use req.user._id

  console.log(image);

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: "Attached file is not an image!",
      product: { title, price, description },
      validationErrors: [],
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: { title, price, description },
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;

  try {
    const product = new Product({
      title,
      price,
      description,
      imageUrl,
      userId,
    });

    await product.save();
  } catch (err) {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error);
    // return res.redirect("/500");
  }
  res.redirect("/admin/products");
};

exports.postDeleteProduct = async (req, res, next) => {
  const productId = req.body.productId;
  await Product.deleteOne({ _id: productId, userId: req.user._id });
  res.redirect("/admin/products");
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit; // This returns "true" not true
  if (!editMode) {
    return res.redirect("/");
  }

  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);
    if (!product) {
      return res.redirect("/");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      hasError: false,
      errorMessage: null,
      product,
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatus = 500;
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const image = req.file;

  const product = await Product.findById(prodId);
  if (!req.user._id.toString() === product.userId.toString())
    return res.redirect("/");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/add-product",
      editing: true,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: { title, price, description },
      validationErrors: errors.array(),
      _id: prodId,
    });
  }

  product.title = title;
  product.price = price;
  product.description = description;
  if (image) product.imageUrl = image.path;

  await product.save();
  res.redirect("/admin/products");
};

exports.getProducts = async (req, res, next) => {
  const products = await Product.find({ userId: req.user._id });
  // .select("title price -_id") // to fetch selected data from a query
  // .populate("userId", "name"); // to populates any "ref Object Id" with the actual data automatically! Second param is opt

  res.render("admin/products", {
    prods: products,
    pageTitle: "Admin Products",
    path: "/admin/products",
    // isAuthenticated: req?.session?.isLoggedIn,
    // hasProducts: products.length > 0,
    // activeShop: true,
    // productCSS: true,
  });
};
