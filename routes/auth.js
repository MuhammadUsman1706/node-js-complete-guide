const express = require("express");
const { check, body } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    body("email", "Please enter a valid email!")
      .isEmail()
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (!userDoc) throw new Error("Invalid email or password!");

        return true;
      })
      .normalizeEmail(),

    body("password")
      .custom(async (value, { req, res }) => {
        const userDoc = await User.findOne({ email: req.body.email });
        const doMatch = await bcrypt.compare(value, userDoc.password);
        if (!doMatch) throw new Error("Invalid email or password!");
        req.session.isLoggedIn = true;
        req.session.user = userDoc;
        req.session.save();
        return true;
      })
      .trim(),
  ],
  authController.postLogin
);

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
      })
      .normalizeEmail(),
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
      })
      .trim(),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
