const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    validate: [validator.isEmail, "Please enter a valid email"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 4,
    select: false,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.createJWT = function () {
  return jwt.sign({ id: this._id, name: this.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP,
  });
};

UserSchema.methods.checkHashedPassword = async function (userPass) {
  return await bcrypt.compare(userPass, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
