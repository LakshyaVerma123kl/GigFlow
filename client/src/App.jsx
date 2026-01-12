import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Styles

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateGig from "./pages/CreateGig";
import GigDetails from "./pages/GigDetails";

function App() {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only connect if user is logged in
    if (user && user.id) {
      // Ensure user.id matches what backend expects
      const socket = io("http://localhost:5000", {
        query: { userId: user.id }, // Send UserID to backend
      });

      // Listen for notifications
      socket.on("notification", (data) => {
        if (data.type === "hired") {
          // Play a sound (optional) or just show toast
          toast.success(data.message, {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
          });
        }
      });

      // Cleanup on logout/unmount
      return () => socket.disconnect();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans transition-colors duration-300">
      <Navbar />

      {/* Toast Notification Container */}
      <ToastContainer />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-gig" element={<CreateGig />} />
        <Route path="/gig/:id" element={<GigDetails />} />
      </Routes>
    </div>
  );
}

export default App;
