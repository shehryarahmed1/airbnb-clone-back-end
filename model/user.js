const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  work: {
    type: String,
    require: true,
  },
  country: {
    type: String,
    require: true,
  },
  about: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  phone: {
    type: Number,
    require: true,
  },
  created_at: {
    type: String,
    require: true,
  },
  updated_at: {
    type: String,
  },
  profile_image: {
    type: String,
  },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reservation" }],
});

module.exports = mongoose.model("User", userSchema);
