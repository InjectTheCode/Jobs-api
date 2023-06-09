const express = require("express");
const {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
} = require("../controllers/jobs.controller");
const router = express.Router();

router.route("/").post(createJob).get(getAllJobs);
router.route("/stats").get(showStats);
router.route("/:id").get(getJob).delete(deleteJob).patch(updateJob);

module.exports = router;
