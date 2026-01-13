import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const CreateGig = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // DEBUG CODE - Add this
    const userStr = localStorage.getItem("user");
    console.log("Raw localStorage:", userStr);
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log("Parsed user:", user);
      console.log("Token exists:", !!user.token);
      console.log("Token value:", user.token);
    }
    // END DEBUG CODE

    setLoading(true);
    try {
      await api.post("/gigs", formData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post gig");
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Post a New Job
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Fill in the details to find the perfect freelancer.
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Job Title
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Build a React Website"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              required
              rows="6"
              placeholder="Describe the project requirements, deliverables, and timeline..."
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              onChange={handleChange}
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Budget ($)
            </label>
            <input
              type="number"
              name="budget"
              required
              placeholder="500"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform duration-100"
          >
            {loading ? "Posting Job..." : "Post Job Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGig;
