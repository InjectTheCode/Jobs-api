require("dotenv").config();
require("express-async-errors");
const express = require("express");
const authRoute = require("./routes/auth.route");
const jobsRoute = require("./routes/jobs.route");

const app = express();

// error handler
const notFoundMiddleware = require("./middleware/not-found.midd");
const errorHandlerMiddleware = require("./middleware/error-handler.midd");

app.use(express.json());
// extra packages

// routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/jobs", jobsRoute);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
