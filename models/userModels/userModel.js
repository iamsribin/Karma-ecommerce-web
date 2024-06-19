const mongo = require("mongoose");
const { Schema, model } = mongo;

const userSchema = Schema({
    
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  // number: { type: Number},
  status: { type: String, enum: ["active", "blocked"], default: "active" },

  profilePicture: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  },

  role: { type: String, enum: ["admin", "user"], default: "user" },
  otp: { type: String, require: true },

  createdAt: {
    type: String,
    default: function () {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split("T")[0];
      const formattedTime = currentDate.toLocaleTimeString("en-US", {
        hour12: true,
      });
      return `Date: ${formattedDate}, Time: ${formattedTime}`;
    },
  },

});

module.exports = model("user", userSchema);
