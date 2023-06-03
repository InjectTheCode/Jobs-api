const { CustomAPIError } = require("../errors");
const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  let error = err;

  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (error.name === "ValidationError") {
    const errorValue = Object.values(error.errors).map((el) => el.message);
    const errorMessage = `Invalid input data. ${errorValue.join(". ")}`;
    return res.status(400).json({ message: errorMessage });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
};

module.exports = errorHandlerMiddleware;
