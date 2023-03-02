const express = require("express");
const controller = require("../controller/controller");
const route = express.Router();
const { verificationToken } = require("../middleware/requireLogin");
route.post("/signup", controller.signup);
route.get("/", controller.home);
route.post("/signin", controller.signin);
route.post("/create", verificationToken, controller.createroom);
route.post("/create/many", verificationToken, controller.createmanyroom); // Just for dev purpose
route.post("/api/reserve", verificationToken, controller.reserve);
route.get("/:id", controller.single);
route.get("/api/experiences", verificationToken, controller.exp);
route.post("/api/review", verificationToken, controller.review);
route.get("/api/main", controller.main);
route.get("/api/map/pointers", controller.get_all_map_pointers);
route.get(
  "/api/reservations/today",
  verificationToken,
  controller.reservationstoday
);
route.get("/api/dashboard/graph", verificationToken, controller.graph);
route.get(
  "/api/dashboard/reservations/upcoming",
  verificationToken,
  controller.upcoming_reservation_dashboard
);
route.put("/api/update/room/:id", verificationToken, controller.update_room);
route.get("/api/get/room/:id", verificationToken, controller.single_room_edit);
route.get("/api/get/my/user", verificationToken, controller.get_user_data);
route.put("/api/update/user", verificationToken, controller.update_user);
route.get(
  "/api/myreservations/upcoming",
  verificationToken,
  controller.reservations_by_user_upcoming
);

route.get(
  "/api/myreservations/past",
  verificationToken,
  controller.reservations_by_user_past
);

route.get(
  "/api/myreservations/unreviewed",
  verificationToken,
  controller.reservations_by_user_unreviewed
);

route.get(
  "/api/myreservations/reviewed",
  verificationToken,
  controller.reservations_by_user_reviewed
);

module.exports = route;
