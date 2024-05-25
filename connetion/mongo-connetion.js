const mongoose = require("mongoose");

const  connectToDatabase = async ()=> {
    try {

      await mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,

      });
      console.log("MONGO connected...");
      
    } catch (err) {
      console.error("Error connecting to the database:", err);
      process.exit(1);
    }
  }
  
 module.exports = connectToDatabase;