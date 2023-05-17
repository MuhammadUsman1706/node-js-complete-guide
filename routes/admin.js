const express = require("express");
const adminController = require("../controllers/admin");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const multer = require("multer");
const { body } = require("express-validator");

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // A callback to store the image, first param is the error param to tell multer that file in invalid
    cb(null, "images"); // folder name
  },
  filename: (req, file, cb) => {
    // new Date => to avoid name clash, originalname => original name with extension
    cb(
      null,
      `${new Date().toISOString().replaceAll(":", "-")}-${file.originalname}`
    );
  },
});

const fileFilter = function (req, file, cb) {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else cb(null, false);
};

const upload = multer({
  storage: fileStorage,
  fileFilter,
});

router.get("/add-product", isAuth, adminController.getAddProduct);
router.get("/products", isAuth, adminController.getProducts);
router.post(
  "/add-product",
  upload.single("image"),
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
  upload.single("image"),
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
  isAuth,
  adminController.postEditProduct
);
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
