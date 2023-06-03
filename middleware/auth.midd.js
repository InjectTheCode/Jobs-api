const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");
const catchAsync = require("../utils/catchAsync");

const authMiddleware = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  let token;
  if (authorization) {
    token = authorization.includes("Bearer ")
      ? authorization.split(" ")[1]
      : authorization;
  }
  if (!token) {
    throw new UnauthenticatedError(
      "You are not logged in, Please log in to get access."
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new UnauthenticatedError(
      "The user belonging to this token does no longer exist."
    );
  }

  req.user = user;

  next();
});

module.exports = authMiddleware;
