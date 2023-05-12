const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
// const multer = require("multer");
const mongoose = require("mongoose");
const session = require("express-session");
const csrf = require("csurf");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const User = require("./models/user");
const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
  // can also provide "expires" here for mongoDB to automatically clean it
});
const csrfProtection = csrf();

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // A callback to store the image, first param is the error param to tell multer that file in invalid
//     cb(null, "images"); // folder name
//   },
//   filename: (req, file, cb) => {
//     // new Date => to avoid name clash, originalname => original name with extension
//     cb(null, `${new Date().toISOString()}-${file.originalname}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     cb(null, true);
//   } else cb(null, false);
// };

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(
//   multer({ dest: "images", storage: fileStorage, fileFilter }).single("image")
// ); // single indicates it is for a single file, where as image is the input name
app.use(express.static(path.join(__dirname, "public")));
// express will encrypt the session ID according to the secret here, should be a long string in production
// resave and saveUninitialized false means the session will not be saved on every incoming request or unnecessarily, but only when session is changed (for better performance)
app.use(
  session({
    secret: process.env.SC_KEY,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

// Now in every post request, it will check if csrf token is coming from the views, cancel it if not.
app.use(csrfProtection);
app.use(flash());

app.use(async (req, res, next) => {
  try {
    if (!req.session.user) {
      return next();
    }
    const user = await User.findById(req.session.user._id);
    if (user) req.user = user;
    next();
  } catch (err) {
    throw new Error(err);
  }
});

app.use((req, res, next) => {
  // to make this available in every view
  res.locals.isAuthenticated = req?.session?.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);
// As a fallback for 404 page
app.use(errorController.get404);
app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...)
  res.redirect("/500");
});

mongoose.connect(MONGODB_URI).then(() => {
  app.listen(3000);
});
