const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const passport = require("passport");
const flash = require("connect-flash");
require("dotenv").config();
const userRouter = require("./routes/userRouters/userRouter");
const googleAuthController = require("./routes/userRouters/googleAuthRouter");
const adminRouter = require("./routes/adminRouters/adminRouter");
require("./connetion/passport");
const connectToDatabase = require("./connetion/mongo-connetion");

app.set("view engine", "ejs");


//user
app.use("/", express.static(path.join(__dirname, "/views/user")));
app.use("/", express.static(path.join(__dirname, "/public/user")));
app.use("/images", express.static(path.join(__dirname, "/images")));
app.use("/", express.static(path.join(__dirname, "/controller")));

//admin
app.use("/admin", express.static(path.join(__dirname, "/views/admin")));
app.use("/adminpublic", express.static(path.join(__dirname, "/public/admin")));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000 
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(passport.authenticate('session'));

app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
  });

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const PORT = 4000 || process.env.PORT;

app.use(cors());

app.use("/", userRouter);
app.use("/admin",adminRouter);
app.use("/auth", googleAuthController);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((error, req, res, next) => {

  const errorStatus = (error.status) ? error.status : 500; 
  const errorMessage = (error.message) ? error.message : "Something went wrong";

  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: error.stack,
  });

});

app.get("/internalError", (req, res) =>{
  res.status(500).render("errorPages/500");
})

app.get("*", (req, res) => {
  res.status(404).render("errorPages/404");
});



connectToDatabase();

app.listen(PORT, () => {
  console.log(`server start http://localhost:${PORT}`);
});
