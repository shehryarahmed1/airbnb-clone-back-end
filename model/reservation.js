const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const reservationSchema = new mongoose.Schema({
  dateStart: { type: Date },
  dateEnd: { type: Date },
  guests: { type: Number },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  month: {
    type: String,
  },
});

module.exports = mongoose.model("Reservation", reservationSchema);
