
const userDB = require("../../models/userModels/userModel")
const {createError} = require("../../utils/errors");

// Google authentication success handler
exports.googleLoginSucess = async (req, res, next) => {
  try {
    if (req.user) {
      const { displayName: name, photos, emails, id: googleId } = req.user;
      const photo = photos && photos.length > 0 ? photos[0].value : null;
      const email = emails && emails.length > 0 ? emails[0].value : null;

      const existingUser = await userDB.findOne({ googleId: { $exists: true }, email: email});
      const loginWithEmail = await userDB.findOne({ email: email });

      if( loginWithEmail && !existingUser){
        return res.redirect("/login?error=" + encodeURIComponent("You are already logged in with email, please try to login with email"));
      }

      if (existingUser) {
        req.login(existingUser, (err) => {
          if (err) {
            return next(createError(null,null));
          }

          req.session.user = name;
          req.session.userGmail = email;
          req.session.userId = existingUser._id;
          return res.redirect("/");

        }); 
      } else {
        const newUser = new userDB({
          name,
          email,
          googleId: googleId,
          profilePicture: photo,
        }); 

        let savedUser = await newUser.save();

        // Log in the new user
        req.login(savedUser, (err) => {
          if (err) {
            return next(createError(null,null));
          }
          
          req.session.user = name;
          req.session.userGmail = email;
          req.session.userId = savedUser._id;

          return res.redirect("/");
        });
      } 
    } else {
     return next(createError(403, "Not Authorized!"));
    }
  } catch (error) {
   return next(createError(null, null));
  }
};

// Google authentication failure handler
exports.googleLoginFaild = (req, res) => {
  return next(createError(401,"Login failure"));
};
