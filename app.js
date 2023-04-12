const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
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

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
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
  if (!req.session.user) {
    return next();
  }
  // "6420a4628da40e132f80e30e"
  const user = await User.findById(req.session.user._id);
  req.user = user;
  next();
});

// To register the routes here
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
// As a fallback for 404 page
app.use(errorController.get404);

mongoose.connect(MONGODB_URI).then(() => {
  app.listen(3000);
});
