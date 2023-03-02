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
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: String,
  },
  profile_image: {
    type: String,
    default:
      "https://t4.ftcdn.net/jpg/03/31/69/91/360_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
  },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reservation" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

module.exports = mongoose.model("User", userSchema);
