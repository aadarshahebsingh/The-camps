module.exports.isLoggedIn = (req, res, next) => {
  req.session.returnTo = req.originalUrl;
  console.log(req.session.returnTo,2);
    if (!req.isAuthenticated()) {
      req.flash("error", "You must be signed in");
      return res.redirect("/login");
    }
    next();
}
