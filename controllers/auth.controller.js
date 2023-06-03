const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");
const User = require("../models/User.model");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
  CustomAPIError,
} = require("../errors");

const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new BadRequestError("Please provide a name, email and password");
  }

  const user = await User.create({ ...req.body });
  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    message: "User created successfully",
    token,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new UnauthenticatedError(
      "Invalid email or password, please provide email and password."
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.checkHashedPassword(password, user.password))) {
    throw new UnauthenticatedError("Invalid email or password!");
  }
  const token = user.createJWT();

  res.status(StatusCodes.OK).json({
    user: user.name,
    token,
  });
});

module.exports = {
  register,
  login,
};
