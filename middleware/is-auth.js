module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }

  // of course if we pass the if check we pass it to the next controller (that requires login access)
  next();
};
