const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
// My solution
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
    csrfToken: req.csrfToken(),
    errorMessage: message,
    isAuthenticated: false,
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
    isAuthenticated: false,
    errorMessage: message,
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

  // To ensure that email does not already exist
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    req.flash("error", "Email already exists!");
    return res.redirect("/signup");
  }
  // 12 is the value of how complicated (secure) the encryption should be. Higher is more secure, but slower.
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    email,
    password: hashedPassword,
    cart: { items: [] },
  });
  // await user.save();

  // returns a promise so we can use await, but not necessary here
  transporter.sendMail({
    to: email,
    from: "support@nodeshop.com",
    subject: "Sign Up Succeeded!",
    html: "<h1>You successfully signed up!</h1>",
  });

  // try {
  //   await sgMail.send({
  //     to: email,
  //     from: "usman1706@hotmail.com",
  //     subject: "Sign Up Succeeded!",
  //     text: "You successfully signed up!",
  //     html: "<h1>You successfully signed up!</h1>",
  //   });
  // } catch (err) {
  //   console.log(err);
  // }

  res.redirect("/login");
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};
