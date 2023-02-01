const express = require("express");
const controller = require("../controller/controller");
const route = express.Router();
const { verificationToken } = require("../middleware/requireLogin");
route.post("/signup", controller.signup);
route.post("/", controller.home);
route.post("/signin", controller.signin);
route.post("/create", verificationToken, controller.createroom);
route.post("/create/many", verificationToken, controller.createmanyroom);
route.post("/reserve", verificationToken, controller.reserve);
route.get("/:id", controller.single);
route.get("/api/experiences", verificationToken, controller.exp);
route.post("/review", verificationToken, controller.review);
route.get("/api/main", controller.main);
route.get("/api/map/pointers", controller.get_all_map_pointers);
route.get(
  "/api/reservations/today",
  verificationToken,
  controller.reservationstoday
);
route.put("/api/update/room/:id", verificationToken, controller.update_room);
route.get("/api/get/room/:id", verificationToken, controller.single_room_edit);
route.get("/api/get/user/:id", verificationToken, controller.get_user_data);
route.put("/api/update/user/:id", verificationToken, controller.update_user);
route.get(
  "/api/myreservations",
  verificationToken,
  controller.reservations_by_user
);

module.exports = route;
