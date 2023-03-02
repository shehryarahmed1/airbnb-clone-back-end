const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const roomSchema = new mongoose.Schema({
  houseType: {
    type: String,
    require: true,
  },
  guests: {
    type: Number,
    require: true,
  },
  category: {
    type: String,
  },
  total_occupancy: {
    type: Number,
    require: true,
  },
  total_bedrooms: {
    type: Number,
    require: true,
  },
  total_bathrooms: {
    type: Number,
    require: true,
  },
  summary: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  has_tv: {
    type: Boolean,
    require: true,
  },
  has_kitchen: {
    type: Boolean,
    require: true,
  },
  has_aircon: {
    type: Boolean,
    require: true,
  },
  has_heating: {
    type: Boolean,
    require: true,
  },
  has_internet: {
    type: Boolean,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  place: {
    type: String,
  },
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reservation" }],
  images: [
    {
      type: String,
    },
  ],
  reviews: [
    {
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
      reviewer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reservation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
      },
    },
  ],
});

module.exports = mongoose.model("Room", roomSchema);
