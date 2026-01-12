const express = require("express");
const router = express.Router();
const {
  placeBid,
  getBidsForGig,
  hireFreelancer,
} = require("../controllers/bidController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, placeBid);
router.get("/:gigId", verifyToken, getBidsForGig);
router.patch("/:bidId/hire", verifyToken, hireFreelancer); // The Hire Endpoint

module.exports = router;
