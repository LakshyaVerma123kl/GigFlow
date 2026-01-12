import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../utils/api";

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Initialize hook
  const { user } = useSelector((state) => state.auth);

  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidForm, setBidForm] = useState({ message: "", price: "" });
  const [loading, setLoading] = useState(true);

  const isOwner = user && gig && user.id === gig.ownerId._id;

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const { data } = await api.get(`/gigs/${id}`);
        setGig(data);
      } catch (err) {
        toast.error("Failed to load gig details");
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [id]);

  useEffect(() => {
    if (isOwner) {
      const fetchBids = async () => {
        try {
          const { data } = await api.get(`/bids/${id}`);
          setBids(data);
        } catch (err) {
          console.error("Failed to load bids");
        }
      };
      fetchBids();
    }
  }, [isOwner, id]);

  // --- DELETE FUNCTIONALITY ---
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/gigs/${id}`);
      toast.success("Job deleted successfully", { theme: "colored" });
      navigate("/"); // Redirect to Home
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete job", {
        theme: "colored",
      });
    }
  };
  // ----------------------------

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/bids", {
        gigId: id,
        message: bidForm.message,
        price: bidForm.price,
      });

      toast.success("Proposal submitted successfully!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });

      setBidForm({ message: "", price: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place bid", {
        position: "top-center",
        theme: "colored",
      });
    }
  };

  const handleHire = async (bidId) => {
    if (
      !window.confirm(
        "Are you sure you want to hire this freelancer? This will reject all other bids."
      )
    )
      return;

    try {
      await api.patch(`/bids/${bidId}/hire`);
      setGig({ ...gig, status: "assigned" });
      setBids(
        bids.map((bid) =>
          bid._id === bidId
            ? { ...bid, status: "hired" }
            : { ...bid, status: "rejected" }
        )
      );

      toast.success("Freelancer Hired Successfully!", {
        position: "top-center",
        theme: "colored",
      });
    } catch (err) {
      toast.error(
        "Hiring failed: " + (err.response?.data?.message || err.message),
        {
          position: "top-center",
          theme: "colored",
        }
      );
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!gig)
    return <div className="p-8 text-center text-red-500">Gig not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Main Gig Card */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8 transition-colors duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {gig.title}
            </h1>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <span className="mr-2">
                Posted by{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {gig.ownerId.name}
                </span>
              </span>
              <span>• {new Date(gig.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-5 py-2 rounded-full font-bold text-sm text-white capitalize shadow-sm ${
                gig.status === "open"
                  ? "bg-green-500 shadow-green-500/30"
                  : "bg-gray-500 shadow-gray-500/30"
              }`}
            >
              {gig.status}
            </div>

            {/* DELETE BUTTON (Visible only to Owner) */}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition border border-red-200 dark:border-red-800"
                title="Delete Job"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Budget
          </span>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
            ${gig.budget}
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg border border-gray-100 dark:border-gray-700">
          {gig.description}
        </div>
      </div>

      {/* === OWNER SECTION: Bids Management === */}
      {isOwner && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            Proposals
            <span className="ml-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm py-1 px-3 rounded-full">
              {bids.length}
            </span>
          </h2>

          {bids.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 italic">
              No proposals received yet.
            </div>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div
                  key={bid._id}
                  className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                        {bid.freelancerId.name}
                      </h4>
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                        ${bid.price}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {bid.message}
                    </p>

                    <div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded border inline-block
                        ${
                          bid.status === "hired"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                            : bid.status === "rejected"
                            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                            : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                        }`}
                      >
                        {bid.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {gig.status === "open" && (
                    <div className="flex items-center">
                      <button
                        onClick={() => handleHire(bid._id)}
                        className="w-full sm:w-auto bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-white/90 transition shadow-lg shadow-gray-500/20"
                      >
                        Hire
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === FREELANCER SECTION: Submit Bid === */}
      {!isOwner && gig.status === "open" && user && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-t-4 border-blue-600 dark:border-blue-500 transition-colors">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Submit a Proposal
          </h2>
          <form onSubmit={handleBidSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Cover Letter
              </label>
              <textarea
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                rows="4"
                required
                value={bidForm.message}
                onChange={(e) =>
                  setBidForm({ ...bidForm, message: e.target.value })
                }
                placeholder="Explain why you are the best fit for this job..."
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Bid Amount ($)
              </label>
              <input
                type="number"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                value={bidForm.price}
                onChange={(e) =>
                  setBidForm({ ...bidForm, price: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
            >
              Send Proposal
            </button>
          </form>
        </div>
      )}

      {/* CLOSED STATE for Non-Owners */}
      {gig.status === "assigned" && !isOwner && (
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-xl text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Job Closed
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            This job has been assigned to a freelancer and is no longer
            accepting proposals.
          </p>
        </div>
      )}
    </div>
  );
};

export default GigDetails;
