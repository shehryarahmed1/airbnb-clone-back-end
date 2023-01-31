const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Room = require("../model/room");

dotenv.config();

const connectionDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useFindAndModify:false, //dont use these now
      // useCreateIndex: true, // don’t use now
    });
    console.log(`Connection successful ${conn.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectionDB;
