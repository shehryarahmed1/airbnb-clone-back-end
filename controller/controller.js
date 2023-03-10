const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Room = require("../model/room");
const Review = require("../model/review");
const Reservation = require("../model/reservation");
const { request } = require("express");
const dotenv = require("dotenv");
dotenv.config();

// Fetching all the latitude and longitudes so that on front-end we can render them on map
exports.get_all_map_pointers = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  try {
    const rooms = await Room.find(
      {
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [req.headers.longitude, req.headers.latitude],
            },
            $maxDistance: 1000000,
          },
        },
      },
      { location: 1, images: 1, place: 1, price: 1 }
    );
    res.status(200).json({ rooms });
  } catch (err) {
    res.status(500).json(err);
  }
};

// Listing rooms based on some criteria
exports.main = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 8;
    const cat = req.query.cat || "Houses";
    const house_type = req.query.type || "";
    const place = req.query.place || "";
    const guests = req.query.guests || "";
    let sort = req.query.sort || "";
    req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

    let sortBy = {};
    if (sort[1]) {
      sortBy[sort[0]] = sort[1];
    } else {
      sortBy[sort[0]] = "desc";
    }

    let rooms;

    if (guests || house_type || place || cat) {
      rooms = await Room.find({
        guests: guests || { $exists: true },
        houseType: house_type || { $exists: true },
        place: place || { $exists: true },
        category: cat,
      })
        .sort(sortBy)
        .skip(page * limit)
        .limit(limit);
      // forward the request
    } else {
      // do not forward the request
      console.log("Values not provided");
    }

    const response = {
      error: false,
      page: page + 1,
      limit,
      rooms,
    };
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: err });
  }
};
// Updating a users data

exports.update_user = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  var update_user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: req.body,
    },
    { new: true }
  );
  res.status(200).json({ update_user });
};

// Update room

exports.update_room = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  try {
    const exect_room = await Room.find({ _id: req.params.id });
    if (exect_room[0].owner_id == req.user._id) {
      const update_room = await Room.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(update_room);
    } else {
      res.status(500).json({ msg: "Access denied" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get a user's data to update
exports.get_user_data = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  try {
    const user_data = await User.find({ _id: req.user._id });
    res.status(200).json(user_data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get a rooms data to update
exports.single_room_edit = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  try {
    const update_room = await Room.find({ _id: req.params.id });
    if (update_room[0].owner_id == req.user._id) {
      res.status(200).json(update_room);
    } else {
      res.status(500).json({ msg: "Access denied" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/* create & save new user */
exports.home = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  const authTokenHeader = req.headers.token;
  if (authTokenHeader) {
    const token = authTokenHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json(err);
      User.findById(user._id, function (err, user) {
        if (err) {
          return console.log(err);
        }

        user.password = undefined;
        console.log(user);
        res.status(200).json({ LoggedinUser: user });
      });
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
  // res.status(200).json({ message: "Successfull" });
};

exports.exp = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  Reservation.find({ creator: req.user._id })
    .populate("creator")
    .populate("room")
    .sort({ _id: -1 })
    .then((rooms) => {
      res.json({ rooms });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.reservations_by_user_upcoming = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  // required validate request
  const currentDate = new Date();
  const latestDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    19,
    0,
    0,
    0
  ).toISOString();
  console.log(latestDate);
  Reservation.find({ creator: req.user._id, dateStart: { $gt: latestDate } })
    .populate("room")
    .sort({ dateStart: 1 })
    .then((reservations) => {
      res.json({ reservations });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.reservations_by_user_unreviewed = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  const currentDate = new Date();
  const latestDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    19,
    0,
    0,
    0
  ).toISOString();
  console.log(latestDate);
  try {
    const Reservations_by_user = await Reservation.find({
      creator: req.user._id,
      // dateEnd: { $lt: latestDate },
    })
      .populate("room")
      .populate("room.reviews");
    let unreviewed_rooms = [];
    for (let index = 0; index < Reservations_by_user.length; index++) {
      const single_reservation = Reservations_by_user[index];
      if (single_reservation.room?.reviews?.length == 0) {
        unreviewed_rooms = [...unreviewed_rooms, single_reservation];
        console.log("No review on this room");
      } else {
        const hasReviewed = (reviewer_id) => (obj) =>
          obj.reviewer_id == reviewer_id;
        const result = !single_reservation.room?.reviews?.some(
          hasReviewed(req.user._id)
        );
        if (result == true) {
          unreviewed_rooms = [...unreviewed_rooms, single_reservation];
        }
        console.log(result); // Output: true
      }
      // console.log(single_reservation);
    }

    res.status(200).json({ rooms: unreviewed_rooms });
    // console.log(unreviewed_rooms);
    // res.json({ Reservations_by_user });
  } catch (err) {
    console.log(err);
  }
};

exports.reservations_by_user_reviewed = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  try {
    const Reservations_by_user = await Reservation.find({
      creator: req.user._id,
      // dateEnd: { $lt: latestDate },
    })
      .populate("room")
      // .populate("room.reviews")
      .populate("room.reviews.reviewer_id")
      .sort({ created_at: 1 });
    let reviewed_rooms = [];
    for (let index = 0; index < Reservations_by_user.length; index++) {
      const single_reservation = Reservations_by_user[index];

      const hasReviewed = (reviewer_id) => (obj) =>
        obj.reviewer_id == reviewer_id;
      const result = single_reservation.room.reviews?.some(
        hasReviewed(req.user._id)
      );
      if (result == true) {
        reviewed_rooms = [...reviewed_rooms, single_reservation];
      }
      console.log(result); // Output: true

      // console.log(single_reservation);
    }

    res.status(200).json({ user_id: req.user._id, rooms: reviewed_rooms });
    // console.log(unreviewed_rooms);
    // res.json({ Reservations_by_user });
  } catch (err) {
    console.log(err);
  }
};

exports.reservations_by_user_past = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  // required validate request
  const currentDate = new Date();
  const latestDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    19,
    0,
    0,
    0
  ).toISOString();
  console.log(latestDate);
  Reservation.find({ creator: req.user._id, dateEnd: { $lt: latestDate } })
    .populate("room")
    .sort({ dateStart: 1 })
    .then((reservations) => {
      res.json({ reservations });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.review = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  const { room_id, raiting_num, raiting_content, reservation_id } = req.body;
  req.user.password = undefined;

  try {
    const reservation = await Reservation.find({ _id: reservation_id });
    if (!reservation.length == 0) {
      const review = new Review({
        room_id,
        raiting_num,
        raiting_content,
        reviewer_id: req.user._id,
        reservation_id,
      });
      review
        .save()
        .then((result) => {
          Room.findByIdAndUpdate(
            req.body.room_id,
            {
              $push: {
                reviews: [review],
              },
            },
            { new: true, useFindAndModify: false }
          ).then((a) => {
            console.log(a);
          });
          res.json(result);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return res
        .status(400)
        .json({ message: "Your provided reservation id has not been found" });
    }
  } catch (err) {
    console.log(err);
  }
};
// Admin dash

exports.testing = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  try {
    Room.find()
      .populate("owner_id")
      .populate("reviews.reviewer_id")
      .populate({
        path: "reservations", //In this
        populate: {
          path: "creator", // Populate this
          path: "room", // And this
        },
      })
      .populate({
        path: "reservations",
        populate: {
          path: "creator",
        },
      })
      .then((rooms) => {
        // console.log(rooms.reservations.creator);creator
        res.json({ rooms });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internet server error" });
  }
};

exports.reservationstoday = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  // required validate request

  //   Post.find()
  //     .populate("postedBy", "_id name")
  //     .then((posts) => {
  //       res.json({ posts });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });

  try {
    console.log(req.user._id);
    const single_product = await Room.find({
      owner_id: req.user._id,
    })
      .populate("owner_id")
      .populate("reviews.reviewer_id")
      .populate("reviews.room_id")
      .populate({
        path: "reservations",
        populate: {
          path: "creator",
          path: "room",
        },
      })
      .populate({
        path: "reservations",
        populate: {
          path: "creator",
        },
      });
    // .sort({ _id: -1 });
    let startDays = [];
    let endDays = [];
    let total_reservations = 0;
    let reviews = [];
    for (let index = 0; index < single_product.length; index++) {
      const element = single_product[index];
      reviews.push(element.reviews);
    }
    console.log(single_product.created_at);
    for (let index = 0; index < single_product.length; index++) {
      const element = single_product[index];
      total_reservations = total_reservations + element.reservations.length;
      // console.log(element.reservations.length);
    }
    console.log(total_reservations);
    for (let index = 0; index < single_product.length; index++) {
      const element = single_product[index];
      // if (element.reservations.dateEnd == new Date() + 2) {
      // console.log(element.reservations);
      for (let index = 0; index < element.reservations.length; index++) {
        const element2 = element.reservations[index];
        // if (
        //   element2.dateStart.getDate() == new Date().getDate &&
        //   element2.dateStart.getMonth() == new Date().getMonth() &&
        //   element2.dateStart.getYear() == new Date().getYear()
        // ) {
        //   console.log(element2);
        //   startDays.push(element2);
        // }
        // console.log(new Date().getDate();
        if (
          element2.dateStart.getDate() === new Date().getDate() &&
          element2.dateStart.getMonth() === new Date().getMonth() &&
          element2.dateStart.getYear() === new Date().getYear()
        ) {
          // console.log(element2);
          startDays.push(element2);
        }

        if (
          element2.dateEnd.getDate() === new Date().getDate() &&
          element2.dateEnd.getMonth() === new Date().getMonth() &&
          element2.dateEnd.getYear() === new Date().getYear()
        ) {
          // console.log(element2);
          endDays.push(element2);
        }
        // if (
        //   element2.dateStart.getDate() == new Date().getDate() &&
        //   element2.dateStart.getMonth() == new Date().getMonth() &&
        //   element2.dateStart.getYear() == new Date().getYear()
        // ) {
        //   console.log(element2);
        //   startDays.push(element2);
        // }
        // console.log(element2.dateStart.getDate());
        // console.log(new Date().getDate());
      }
      // }
    }
    // console.log(new Date().getDate());
    res.status(200).json({
      startDays,
      endDays,
      total_reservations,
      reviews,
      single_product,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.graph = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  try {
    const month_of_reservation = await Reservation.aggregate([
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
          room: { $first: "$room" },
        },
      },
      {
        $sort: {
          count: 1,
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "room",
        },
      },
    ]);

    res.status(200).json({
      month_of_reservation,
    });
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
};

exports.upcoming_reservation_dashboard = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  try {
    const currentDate = new Date();
    const latestDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      19,
      0,
      0,
      0
    ).toISOString();
    let reservationsOnMyRooms = [];
    const upcoming_reservations_on_my_rooms = await Reservation.find({
      dateStart: { $gt: latestDate },
    })
      .sort({ dateStart: 1 })
      .populate("room", "images place category owner_id")
      .populate("creator", "profile_image name phone");

    for (
      let index = 0;
      index < upcoming_reservations_on_my_rooms.length;
      index++
    ) {
      const element = upcoming_reservations_on_my_rooms[index];
      if (element.room?.owner_id == req.user._id) {
        reservationsOnMyRooms = [...reservationsOnMyRooms, element];
      }
      // console.log(element);
    }

    res.status(200).json({
      reservationsOnMyRooms,
    });
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
};

exports.single = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  try {
    const single_product = await Room.findById(req.params.id)
      .populate("reservations")
      .populate("owner_id", "name phone profile_image")
      .populate("reviews.reviewer_id");
    res.status(200).json(single_product);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.reserve = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  req.user.password = undefined;
  const { dateStartB, dateEnd, room, guests } = req.body;

  if (!dateStartB || !dateEnd || !room || !guests) {
    return res.status(422).json({ error: "Please add all the fields" });
  }

  let dateStart = new Date(dateStartB);
  dateStart.setDate(dateStart.getDate() + 1);

  const single_product = await Room.findById(room).populate("reservations");
  let disabledDates = [];

  var getDaysArray = function (start, end) {
    for (
      var arr = [], dt = new Date(start);
      dt <= new Date(end);
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.push(new Date(dt));
    }

    return arr;
  };
  let messedupDates = []; //To send to user what dates to fix up

  if (single_product) {
    for (let index = 0; index < single_product.reservations.length; index++) {
      const element = single_product.reservations[index];
      element;
      const dateStartLoop = new Date(
        single_product.reservations[index].dateStart
      );
      const dateEndLoop = new Date(single_product.reservations[index].dateEnd);
      const date = new Date(dateStartLoop.getTime());

      var dates = [];
      while (date <= dateEndLoop) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }

      dates.pop();
      disabledDates.push(dates);
      dates;

      for (let index = 0; index < dates.length; index++) {
        const reservedDay = dates[index];
        let selectedDays = getDaysArray(dateStart, dateEnd);
        for (let index = 0; index < selectedDays.length; index++) {
          const element = selectedDays[index];
          if (element.toString() == reservedDay.toString()) {
            messedupDates.push(element);
            console.log(reservedDay);
          }
        }
      }
    }
  }

  if (messedupDates.length > 0) {
    return res
      .status(422)
      .json({ message: "Days already reserved", days: messedupDates });
  }
  // Dont touch --
  console.log(dateStart.getMonth() + 1);
  const reservation = new Reservation({
    dateStart,
    dateEnd,
    room,
    guests,
    creator: req.user._id,
    month: dateStart.getMonth() + 1,
  });
  await reservation
    .save()
    .then((result) => {
      Room.findByIdAndUpdate(
        room,
        {
          $push: { reservations: [reservation] },
        },
        { new: true, useFindAndModify: false }
      ).then(() => {
        let room_id = result.room.toString();
        User.findByIdAndUpdate(
          result.creator,
          {
            $push: { reservations: [reservation] },
          },
          { new: true, useFindAndModify: false }
        ).then(() => {
          res.send("Completed");
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.Fetchusers = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  // required validate request

  User.find()
    .then((users) => {
      res.json({ users });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.createroom = async (req, res) => {
  // required validate request

  const {
    houseType,
    guests,
    total_occupancy,
    total_bedrooms,
    total_bathrooms,
    summary,
    address,
    has_tv,
    has_kitchen,
    has_aircon,
    has_heating,
    has_internet,
    price,
    latitude,
    longitude,
    images,
    category,
    place,
  } = req.body;
  // if (
  //   !houseType ||
  //   !guests ||
  //   !total_occupancy ||
  //   !total_bedrooms ||
  //   !total_bathrooms ||
  //   !summary ||
  //   !address ||
  //   !price ||
  //   !latitude ||
  //   !longitude ||
  //   !category ||
  //   !images
  // ) {
  //   return res.status(422).json({ error: "Please add all the fields" });
  // }
  // res.send("OK")
  console.log(req.user);
  req.user.password = undefined;
  const room = new Room({
    houseType,
    guests,
    total_occupancy,
    total_bedrooms,
    total_bathrooms,
    summary,
    address,
    has_tv,
    has_kitchen,
    has_aircon,
    has_heating,
    has_internet,
    price,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    owner_id: req.user._id,
    images,
    category,
    place,
  });
  room
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

// Create many rooms

exports.createmanyroom = async (req, res) => {
  // required validate request
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  req.user.password = undefined;

  function between(min, max) {
    return (Math.random() * (min - max) + max).toFixed(4);
  }

  for (let i = 0; i < 500; i++) {
    let category = [
      "Apartments",
      "Houses",
      "Villas",
      "Treehouses",
      "Farms",
      "Cabins",
      "Private rooms",
      "Camping",
      "Beaches",
      "Surfing",
      "Pools",
      "Ships",
      "Castles",
      "Vineyards",
    ];
    let place = [
      "Lahore, Punjab",
      "Queens County, New York",
      "Allama Iqbal Town, Punjab",
      "Karachi, Sindh",
      "South Island, NZ",
      "Paris, Ile-de-France",
      "Rome, Lazio",
      "London, England",
      "Tokyo, JP",
      "Islamabad, Islamabad Capital Territory",
      "Multan, Punjab",
      "Gujranwala, Punjab",
      "Quetta, Balochistan",
      "Sialkot, Punjab",
    ];
    let guests = Math.floor(Math.random() * 10) + 1;
    let houseType = ["Private room", "Shared room", "Entire home"];
    let totalOccupancy = Math.floor(Math.random() * 10) + 1;
    let totalBedrooms = Math.floor(Math.random() * 5) + 1;
    let totalBathrooms = Math.floor(Math.random() * 3) + 1;
    let summary = "A randomly generated room with random features.";
    let address = "123 Main Street, New York, NY";
    let hasTV = Math.random() >= 0.5;
    let hasKitchen = Math.random() >= 0.5;
    let hasAircon = Math.random() >= 0.5;
    let hasHeating = Math.random() >= 0.5;
    let hasInternet = Math.random() >= 0.5;
    let price = Math.floor(Math.random() * 100) + 50;
    // let latitude = Math.random() * 180 - 90;
    // let longitude = Math.random() * 360 - 180;
    let latitude = between(31.5204, 32.504);
    let longitude = between(74.3587, 74.9987);
    let images = [
      "data:image/jpeg;base64,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",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8aG91c2V8ZW58MHx8MHx8&w=1000&q=80",
      "https://images.unsplash.com/photo-1625602812206-5ec545ca1231?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YW1lcmljYW4lMjBob3VzZXN8ZW58MHx8MHx8&w=1000&q=80",
      "https://thumbs.dreamstime.com/b/classic-house-flower-garden-751996.jpg",
      "https://i.pinimg.com/550x/fc/07/40/fc0740d7c26d93974e117cb88a81bc36.jpg",
      "https://static.dezeen.com/uploads/2021/09/moore-house-woods-and-dangaran-mid-century-renovations-architecture-los-angeles-usa-hero.jpg",
      "https://www.bankrate.com/2020/07/27145241/Different_types_houses_pros_cons.jpg?auto=webp&optimize=high&crop=16:9",
      "https://www.baufritz.com/01_Haeuser/Kundenh%C3%A4user/2018/Crossland/Bilder/541/image-thumb__541__houseOverview_auto_2c273d03976da0a9279bc921516b3b7e/-8585821837800397134.jpg",
      "https://images.adsttc.com/media/images/5efe/1f7f/b357/6540/5400/01d7/newsletter/archdaily-houses-104.jpg?1593712501",
      "https://media.istockphoto.com/photos/beautiful-residential-home-exterior-on-bright-sunny-day-with-green-picture-id1211174464?b=1&k=20&m=1211174464&s=612x612&w=0&h=rAGfSLUvnrvPauUveA-upyUtxffW7LvCKvhqYLF8eH8=",
      "https://i.guim.co.uk/img/media/c8607bf5c50b1c3911c7128325d1def1592be37b/218_186_3632_2180/master/3632.jpg?width=1200&quality=85&auto=format&fit=max&s=30d1bb1145239cfafb6d2361868d61bb",
      "https://a0.muscache.com/im/pictures/c750363f-d2c3-4a21-b87c-ef5447e24c73.jpg?im_w=720",
      "https://a0.muscache.com/im/pictures/05dd1b83-e12a-4445-beb1-0267b0cc9d41.jpg?im_w=720",
      "https://a0.muscache.com/im/pictures/miso/Hosting-614244779618455344/original/88897540-a976-4c90-a4bd-e929cd627df0.jpeg?im_w=720",
      "https://a0.muscache.com/im/pictures/miso/Hosting-47753809/original/16620c99-3372-4c1a-b5fc-5e6ad8fa9537.jpeg?im_w=720",
      "https://a0.muscache.com/im/pictures/miso/Hosting-53549003/original/690971c2-4f28-412c-ad71-a07931c988b3.jpeg?im_w=720",
      "https://a0.muscache.com/im/pictures/8e84f093-2ddc-4f7b-850b-01584654dfd7.jpg?im_w=720",
      "https://a0.muscache.com/im/pictures/miso/Hosting-53549003/original/690971c2-4f28-412c-ad71-a07931c988b3.jpeg?im_w=720",
      "https://a0.muscache.com/im/pictures/719b8cd0-fcd5-4554-a106-bf9056fbf627.jpg?im_w=720",
      "https://a0.muscache.com/im/pictures/1ff83c60-3b92-4b0b-a112-501b437463a9.jpg?im_w=720",
    ];

    let first_room = {
      houseType: houseType[Math.floor(Math.random() * houseType.length)],
      guests: guests,
      category: category[Math.floor(Math.random() * category.length)],
      place: place[Math.floor(Math.random() * place.length)],
      total_occupancy: totalOccupancy,
      total_bedrooms: totalBedrooms,
      total_bathrooms: totalBathrooms,
      summary: summary,
      address: address,
      has_tv: hasTV,
      has_kitchen: hasKitchen,
      has_aircon: hasAircon,
      has_heating: hasHeating,
      has_internet: hasInternet,
      price: price,
      // location: {
      //   type: "Point",
      //   coordinates: [longitude.toFixed(4), latitude.toFixed(4)],
      // },
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      images: images[Math.floor(Math.random() * category.length)],
      owner_id: req.user._id,
    };

    const room = new Room(first_room);
    room
      .save()
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
/* retreive & return all users/ retreive a single user */
exports.signup = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  // required validate request
  const { name, email, password, work, about, country, phone, profile_image } =
    req.body;
  if (!email || !password || !name || !work || !about) {
    return res.status(422).json({ error: "Please add all the fields" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: "User already exists with this email" });
      }
      bcrypt.hash(password, 15).then((hashedpassword) => {
        const user = new User({
          email,
          password: hashedpassword,
          name,
          work,
          country,
          phone,
          about,
          profile_image: profile_image,
        });
        user
          .save()
          .then((user) => {
            res.json({ message: user });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.signin = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  // required validate request

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please provide email or password" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (!savedUser) {
        return res.status(422).json({ error: "Invalid email or password" });
      }
      bcrypt.compare(password, savedUser.password).then((doMatch) => {
        if (doMatch) {
          const token = jwt.sign(
            { _id: savedUser._id },
            process.env.JWT_SECRET_KEY
          );
          savedUser.password = undefined;
          res.json({ token });
        } else {
          return res.status(422).json({ error: "Invalid email or password" });
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
