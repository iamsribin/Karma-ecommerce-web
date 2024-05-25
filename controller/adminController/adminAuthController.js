const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

exports.renderLogin = (req, res) => {
  res.render("admin/adminLogin/login");
};

exports.logCheck = (req, res) => {
  try {
    const { gmail, password } = req.body;

    if (ADMIN_EMAIL == gmail && ADMIN_PASSWORD == password) {
      req.session.admin = gmail;
      res.redirect("/admin/dashboard");

    } else {
      console.log("wrong padddd");
    }
  } catch (error) {
    console.log("error in admin login:", error);
  }
};
