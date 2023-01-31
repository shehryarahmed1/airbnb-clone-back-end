const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./database/connection");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

const app = express();
app.use(morgan("tiny"));

app.use(express.json());
app.use(cors());
dotenv.config();

connectDB();

const travelRouter = require("./routes/router");
app.use("/", travelRouter);

app.listen(process.env.PORT, () => {
  console.log("Server has started on PORT " + process.env.PORT);
});
