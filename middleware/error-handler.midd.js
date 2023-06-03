const { CustomAPIError } = require("../errors");
const { StatusCodes } = require("http-status-codes");

const validationErrorHandler = (error, res) => {
  const errorValue = Object.values(error.errors)
    .map((el) => el.message)
    .join(", ");
  const errorMessage = `Invalid input data. ${errorValue}`;
  return res.status(400).json({ message: errorMessage });
};

const duplicateErrorHandler = (error, res) => {
  const value = error.keyValue.email;
  const errorMessage = `Duplicate value entered ${value}, Please choose a different value`;
  return res.status(400).json({ message: errorMessage });
};

const castErrorHandler = (error, res) => {
  const errorValue = `Invalid ${error.path}: ${error.value}.`;
  return res.status(400).json({ message: errorValue });
};

const handleJWTError = (error, res) => {
  const errorMessage = '"Invalid token, Please log in again"';
  return res.status(401).json({ message: errorMessage });
};

// ========> Main error middleware handler <========
const errorHandlerMiddleware = (err, req, res, next) => {
  let error = err;

  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (error.name === "ValidationError") {
    validationErrorHandler(error, res);
  }

  if (error.code === 11000) {
    duplicateErrorHandler(error, res);
  }

  if (error.name === "CastError") {
    castErrorHandler(error, res);
  }

  if (error.name === "JsonWebTokenError") {
    handleJWTError(error, res);
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
};

module.exports = errorHandlerMiddleware;
