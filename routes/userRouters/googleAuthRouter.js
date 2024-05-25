const router = require("express").Router();
const passport = require("passport");
const userController = require("../../controller/userController/googleAuthController");

router.get("/login/sucess", userController.googleLoginSucess);
router.get("/login/failed", userController.googleLoginFaild);

router.get("/google/callback", (req, res, next) => {
  try {
    passport.authenticate("google", (err, user) => {
      if (err) {

        if (err instanceof InternalOAuthError) {
          return next(createError(503, "Network error occurred!"));
        }

        return next(createError(401, "OOPS somting went wrong! try again"));
      }
      if (!user) {
        return next(createError(401, "Authentication failed"));

      }
      req.login(user, (err) => {
        if (err) {

          return next(createError(null, null));
        }

        res.redirect(process.env.CLIENT_URL);
      });
    })(req, res, next);
  } catch (err) {

    console.log("google auth error", err.message);
  }
});

router.post("/logout", function (req, res, next) {
  if (req.session.passport) {

    req.logout(function (err) {
      if (err) {
        return next(err);
      }

      return res.redirect("/");
    });
  } else {
    req.session.destroy((err) => {
      if (err) {
        return next(createError(null, null));
      }
      return res.redirect("/");
    });
  }
});
module.exports = router;
