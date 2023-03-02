const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const reviewSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },
  raiting_num: {
    type: Number,
  },
  raiting_content: {
    type: String,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
  reviewer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reservation_id: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
});

module.exports = mongoose.model("Review", reviewSchema);
