import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const Home = () => {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGigs();
  }, [search]);

  const fetchGigs = async () => {
    try {
      const { data } = await api.get(`/gigs?search=${search}`);
      setGigs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header & Search - Stacked on mobile, row on Desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Find Gigs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Browse open projects and start earning
          </p>
        </div>

        {/* Search Bar - Full width on mobile */}
        <div className="w-full md:w-1/3 relative">
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white pl-10 pr-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Grid: 1 col (mobile) -> 2 col (tablet) -> 3 col (desktop) */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No gigs found matching your search.
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate w-3/4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {gig.title}
                </h3>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800">
                  ${gig.budget}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 grow leading-relaxed">
                {gig.description}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                    {gig.ownerId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-24 md:max-w-32">
                    {gig.ownerId?.name}
                  </span>
                </div>
                <Link
                  to={`/gig/${gig._id}`}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  View Details
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
