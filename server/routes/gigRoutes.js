const express = require("express");
const router = express.Router();
const {
  createGig,
  getAllGigs,
  getGigById,
  deleteGig,
} = require("../controllers/gigController");
const verifyToken = require("../middleware/authMiddleware");

// @route   GET /api/gigs
// @desc    Get all open gigs (Public Feed)
router.get("/", getAllGigs);

// @route   GET /api/gigs/:id
// @desc    Get specific gig details (Public)
router.get("/:id", getGigById);

// @route   POST /api/gigs
// @desc    Post a new job (Protected: Logged in users only)
router.post("/", verifyToken, createGig);

// @route   DELETE /api/gigs/:id
// @desc    Delete a job (Protected: Owner only)
router.delete("/:id", verifyToken, deleteGig);

module.exports = router;
