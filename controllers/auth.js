const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const User = require("../models/user");

// setup telling nodemailer how the emails will be delivered
// const transporter = nodemailer.createTransport(
//   sendGridTransport({
//     auth: {
//       api_key:
//         "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",
//     },
//   })
// );

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "b3463a300b832c",
    pass: "2b9cf116e19102",
  },
});

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    // csrfToken: req.csrfToken(),
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "Invalid email or password!");
    return res.redirect("/login");
  }

  const doMatch = await bcrypt.compare(password, user.password);

  if (!doMatch) {
    req.flash("error", "Invalid email or password!");
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

  const errors = validationResult(req);

  // status 422 is for unsuccessful validation
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  // 12 is the value of how complicated (secure) the encryption should be. Higher is more secure, but slower.
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    email,
    password: hashedPassword,
    cart: { items: [] },
  });
  await user.save();

  // returns a promise so we can use await, but not necessary here
  transporter.sendMail({
    to: email,
    from: "usman1706@hotmail.com",
    subject: "Sign Up Succeeded!",
    html: "<h1>You successfully signed up!</h1>",
  });

  res.redirect("/login");
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }

    const email = req.body.email;
    const token = buffer.toString("hex");
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "No account with that email found!");
      return res.redirect("/reset");
    }

    user.resetToken = token;
    user.resetExpirationToken = Date.now() + 3600000;
    await user.save();

    res.redirect("/");
    transporter.sendMail({
      to: email,
      from: "usman1706@hotmail.com",
      subject: "Password Reset",
      html: `<p>You requested a password reset</p>
      <p>Please click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
      `,
    });
  });
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  // fetches user only if token hasn't expired
  const user = await User.findOne({
    resetToken: token,
    resetExpirationToken: { $gt: Date.now() },
  });

  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  if (user)
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "Update Password",
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token,
    });
  else res.redirect("/");
};

exports.postNewPassword = async (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const passwordToken = req.body.passwordToken;

  const user = await User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetExpirationToken: { $gt: Date.now() },
  });

  if (user) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetExpirationToken = undefined;
    await user.save();
    res.redirect("/login");
  } else {
    res.redirect("/");
  }
};
