const mongoose = require("mongoose");
const moment = require("moment");

const Job = require("../models/Job.model");
const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");

// Get all user's jobs:
const getAllJobs = catchAsync(async (req, res, next) => {
  const { search, status, jobType, sort } = req.query;

  const queryObject = {
    createdBy: req.user.userId,
  };

  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }

  if (status && status !== "all") {
    queryObject.status = status;
  }

  if (jobType && jobType !== "all") {
    queryObject.status = status;
  }

  // Sorting...
  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.sort("position");
  }
  if (sort === "z-a") {
    result = result.sort("-position");
  }

  // Pagination...
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  let result = Job.find(queryObject);

  const jobs = await result;

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({
    jobs,
    totalJobs,
    numOfPages,
  });
});

// Get single job:
const getJob = catchAsync(async (req, res, next) => {
  const {
    user: { id: userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOne({ _id: jobId, createdBy: userId });

  if (!job) {
    throw new NotFoundError(`No job found for ${userId}.`);
  }
  res.status(StatusCodes.OK).json({ job });
});

const createJob = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json(job);
});

// Update job:
const updateJob = catchAsync(async (req, res, next) => {
  const {
    body,
    user: { id: userId },
    params: { id: jobId },
  } = req;

  const filteredObj = filterObj(body, "company", "position");

  if (filteredObj.company === "" || filteredObj.position === "") {
    throw new BadRequestError("Company or Position cannot be empty!");
  }

  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    filteredObj,
    { new: true, runValidators: true }
  );

  if (!job) {
    throw new NotFoundError(`No job found for ${userId}.`);
  }
  res.status(StatusCodes.OK).json({ job });
});

// Delete job:
const deleteJob = catchAsync(async (req, res, next) => {
  const {
    user: { id: userId },
    params: { id: jobId },
  } = req;

  const deletedJob = await Job.findByIdAndDelete({ _id: jobId, createdBy: userId });

  if (!deletedJob) {
    throw new NotFoundError(`No job found for ${userId}.`);
  }
  res.status(StatusCodes.OK);
});

// Show status:
const showStats = catchAsync(async (req, res, next) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.id) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  res.status(StatusCodes.OK).json({ defaultStats });
});

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
};
