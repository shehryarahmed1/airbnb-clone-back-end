const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const mongoose = require("mongoose");

const User = require("../model/user");
dotenv.config();
const verificationToken = (req, res, next) => {
  const authTokenHeader = req.headers.token;
  if (authTokenHeader) {
    const token = authTokenHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json(err);
      req.user = user;
      console.log(user);
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

module.exports = {
  verificationToken,
};
