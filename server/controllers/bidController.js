const Bid = require("../models/Bid");
const Gig = require("../models/Gig");
const mongoose = require("mongoose");

// @desc    Place a bid on a gig
// @route   POST /api/bids
// @access  Private (Freelancer)
exports.placeBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    // 1. Check if Gig exists and is open
    // Safety: Validate ID format to prevent crash
    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      return res.status(400).json({ message: "Invalid Gig ID format" });
    }

    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== "open") {
      return res.status(400).json({ message: "Gig not available for bidding" });
    }

    // 2. Prevent owner from bidding on their own gig
    if (gig.ownerId.toString() === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot bid on your own gig" });
    }

    // 3. Check if user has already placed a bid
    const existingBid = await Bid.findOne({ gigId, freelancerId: req.user.id });
    if (existingBid) {
      return res
        .status(400)
        .json({ message: "You have already placed a bid on this gig" });
    }

    // 4. Create Bid
    const newBid = new Bid({
      gigId,
      freelancerId: req.user.id,
      message,
      price,
    });

    await newBid.save();
    res.status(201).json({ message: "Bid placed successfully", bid: newBid });
  } catch (err) {
    console.error("Error in placeBid:", err);
    res.status(500).json({ message: "Error placing bid", error: err.message });
  }
};

// @desc    Get all bids for a specific gig
// @route   GET /api/bids/:gigId
// @access  Private (Owner Only)
exports.getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    // --- FIX FOR 500 ERROR START ---
    // 1. Validate Gig ID
    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      return res.status(400).json({ message: "Invalid Gig ID" });
    }

    // 2. Ensure User is Authenticated (Extra safety)
    if (!req.user || !req.user.id) {
      console.error("Auth Error: req.user missing in getBidsForGig");
      return res.status(401).json({ message: "User not authenticated" });
    }
    // --- FIX FOR 500 ERROR END ---

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    // 3. Security: Only the owner can view the bids
    if (gig.ownerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to view bids for this gig" });
    }

    // Fetch bids and populate freelancer details
    const bids = await Bid.find({ gigId })
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (err) {
    console.error("Error in getBidsForGig:", err); // Log actual error to console
    res
      .status(500)
      .json({ message: "Error fetching bids", error: err.message });
  }
};

// @desc    Hire a freelancer (Atomic Transaction + Real-time Update)
// @route   PATCH /api/bids/:bidId/hire
// @access  Private (Owner Only)
exports.hireFreelancer = async (req, res) => {
  // Start a MongoDB Session for Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    // Safety: Validate ID
    if (!mongoose.Types.ObjectId.isValid(bidId)) {
      throw new Error("Invalid Bid ID");
    }

    // 1. Find the Winning Bid
    const winningBid = await Bid.findById(bidId).session(session);
    if (!winningBid) throw new Error("Bid not found");

    // 2. Find the Gig
    const gig = await Gig.findById(winningBid.gigId).session(session);
    if (!gig) throw new Error("Gig not found");

    // Security Check: Only owner can hire
    if (gig.ownerId.toString() !== req.user.id) {
      throw new Error("Not authorized to hire for this gig");
    }

    // Integrity Check: Ensure gig isn't already assigned
    if (gig.status === "assigned") {
      throw new Error("This gig is already assigned to another freelancer");
    }

    // 3. ATOMIC UPDATES
    // Update Gig Status -> assigned
    gig.status = "assigned";
    await gig.save({ session });

    // Update Winning Bid Status -> hired
    winningBid.status = "hired";
    await winningBid.save({ session });

    // Update ALL other bids for this gig -> rejected
    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bidId } },
      { status: "rejected" }
    ).session(session);

    // 4. Commit the Transaction (Data is now saved)
    await session.commitTransaction();
    session.endSession();

    // 5. BONUS: Real-time Notification (Socket.io)
    const io = req.io;
    const userSocketMap = req.userSocketMap;

    // Check if io exists (prevents crash if socket isn't connected)
    if (io && userSocketMap) {
      const freelancerSocketId = userSocketMap.get(
        winningBid.freelancerId.toString()
      );
      if (freelancerSocketId) {
        io.to(freelancerSocketId).emit("notification", {
          type: "hired",
          message: `Congratulations! You have been hired for the project: "${gig.title}"`,
          gigId: gig._id,
        });
        console.log(`Notification sent to user ${winningBid.freelancerId}`);
      }
    }

    res.json({
      message: "Freelancer hired successfully",
      gig,
      winningBid,
    });
  } catch (err) {
    // Rollback changes if anything fails
    await session.abortTransaction();
    session.endSession();
    console.error("Error in hireFreelancer:", err);
    res.status(400).json({ message: "Hiring failed", error: err.message });
  }
};
