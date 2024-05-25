const mongoose = require("mongoose");
const usersDB = require("../../models/userModels/userModel");

// render all users in the dashbord
exports.renderCostumers = async (req, res) => {
  try {
    const users = await usersDB.find({});

    res.render("admin/adminDasbord/customers", { users: users });
  } catch (error) {

    return next(createError(null, null));
  }
};

//bock or unblock user
exports.blockOrUnBlockUser = async (req, res, next) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const user = await usersDB.findById(id);

    if (user.status == "active") {
      user.status = "blocked";

    } else {
      user.status = "active";
    }
    user.save();

   return res.status(200).json({ user });
  } catch (error) {

    console.log(error);
  }
};
