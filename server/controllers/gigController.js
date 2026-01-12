const Gig = require("../models/Gig");
const Bid = require("../models/Bid"); // Import Bid to clean up related data

// @desc    Create a new Gig
// @route   POST /api/gigs
// @access  Private
exports.createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    const newGig = new Gig({
      title,
      description,
      budget,
      ownerId: req.user.id, // From authMiddleware
    });

    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (err) {
    res.status(500).json({ message: "Error creating gig", error: err.message });
  }
};

// @desc    Get all Open Gigs (with Search)
// @route   GET /api/gigs
// @access  Public
exports.getAllGigs = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { status: "open" };

    // If search exists, filter by title (case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Populate owner name for display
    const gigs = await Gig.find(query)
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching gigs", error: err.message });
  }
};

// @desc    Get Single Gig Details
// @route   GET /api/gigs/:id
// @access  Public
exports.getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate(
      "ownerId",
      "name email"
    );
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    res.json(gig);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a Gig
// @route   DELETE /api/gigs/:id
// @access  Private (Owner Only)
exports.deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ message: "Gig not found" });

    // Security: Check ownership
    if (gig.ownerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this gig" });
    }

    // Delete the Gig
    await Gig.findByIdAndDelete(req.params.id);

    // Cleanup: Delete all bids associated with this gig so database stays clean
    await Bid.deleteMany({ gigId: req.params.id });

    res.json({ message: "Gig deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
