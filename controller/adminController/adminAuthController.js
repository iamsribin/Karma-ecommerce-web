const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const { createError } = require("../../utils/errors");

//render admin login page 
exports.renderLogin = (req, res) => {
  res.render("admin/adminLogin/login");
};

//check admin login
exports.logCheck = (req, res, next) => {
  try {
    const { gmail, password } = req.body;

    if (ADMIN_EMAIL == gmail && ADMIN_PASSWORD == password) {
      req.session.admin = gmail;

      return res.status(200).send({gmail});
    } else {
      return next(createError(400, "invalid password or email"));
    }
  } catch (error) {
    return next(createError(null, null));
  }
};

//log out
exports.logOut = (req, res, next) => {
  try {
    if (req.session.admin) {
      req.session.destroy((err) => {
        if (err) {
          return next(createError(null, null));
        }
        return res.redirect( "/admin/login");
      });

    }
  } catch (error) {
    return next(createError(null, null));
  }
};
