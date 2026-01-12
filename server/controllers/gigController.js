const Gig = require("../models/Gig");

// Create a new Gig
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

// Get all Open Gigs (with Search)
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
