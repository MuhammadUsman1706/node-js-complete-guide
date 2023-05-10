const express = require("express");

const adminController = require("../controllers/admin");

// express router is designed to create routes seperately, and export them easily
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");

router.get("/add-product", isAuth, adminController.getAddProduct);
router.get("/products", isAuth, adminController.getProducts);
router.post(
  "/add-product",
  isAuth,
  [
    body("title", "Title must at least be 3 characters long.")
      .isString()
      .isLength({
        min: 3,
      }),
    body("price", "Enter a valid price.").isFloat(),
    body("description", "Description can be from 5-200 characters.").isLength({
      min: 5,
      max: 200,
    }),
  ],
  adminController.postAddProduct
);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post(
  "/edit-product",
  [
    body("title", "Title must at least be 3 characters long.")
      .isString()
      .isLength({
        min: 3,
      }),
    body("imageUrl", "Enter a valid image URL.").isURL(),
    body("price", "Enter a valid price.").isFloat(),
    body("description", "Description can be from 5-200 characters.").isLength({
      min: 5,
      max: 200,
    }),
  ],
  isAuth,
  adminController.postEditProduct
);
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
