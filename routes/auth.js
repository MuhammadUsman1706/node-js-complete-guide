const express = require("express");
const { check, body } = require("express-validator");
const User = require("../models/user");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", authController.postLogin);

// Check takes the name of the input in the views and checks it through a built in funtion!
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          throw new Error("Email already exists!");
        }
        return true;
      }),
    // body checks only body, where as check searches everywhere for given keyword, like params, headers, body, etc.
    body(
      "password",
      "The password must be 5 characters long and contain only alphanumeric characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword)
          throw new Error("Passwords do not match!");
        return true;
      }),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
