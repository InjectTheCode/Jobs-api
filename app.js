require("dotenv").config();
require("express-async-errors");
const express = require("express");
const authRoute = require("./routes/auth.route");
const jobsRoute = require("./routes/jobs.route");
const authMidddleware = require("./middleware/auth.midd");

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const app = express();

// error handler
const notFoundMiddleware = require("./middleware/not-found.midd");
const errorHandlerMiddleware = require("./middleware/error-handler.midd");

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
// extra packages

// routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/jobs", authMidddleware, jobsRoute);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
