const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email });

  if (!user) {
    return res.redirect("/login");
  }

  const doMatch = await bcrypt.compare(password, user.password);

  if (!doMatch) {
    return res.redirect("/login");
  }

  req.session.isLoggedIn = true;
  req.session.user = user;
  req.session.save((err) => {
    res.redirect("/");
  });
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // To ensure that email does not already exist
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    return res.redirect("/signup");
  }
  // 12 is the value of how complicated (secure) the encryption should be. Higher is more secure, but slower.
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    email,
    password: hashedPassword,
    cart: { items: [] },
  });
  await user.save();

  res.redirect("/login");
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};
