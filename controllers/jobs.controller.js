const Job = require("../models/Job.model");
const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors");

// Get all user's jobs:
const getAllJobs = catchAsync(async (req, res, next) => {
  const jobs = await Job.find({ createdBy: req.user.id }).sort("createdAt");
  res.status(StatusCodes.OK).json({
    count: jobs.length,
    jobs,
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

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
