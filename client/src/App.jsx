import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components & Pages
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateGig from "./pages/CreateGig";
import GigDetails from "./pages/GigDetails";

function App() {
  const { user } = useSelector((state) => state.auth);

  // Use environment variable for production, fallback to localhost for dev
  const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (user && user.id) {
      const socket = io(SOCKET_URL, {
        query: { userId: user.id },
      });

      // Listen for real-time notifications
      socket.on("notification", (data) => {
        if (data.type === "hired") {
          toast.success(data.message, {
            position: "top-center",
            autoClose: 5000,
            theme: "colored",
          });
        }
      });

      // Cleanup on logout/unmount
      return () => socket.disconnect();
    }
  }, [user, SOCKET_URL]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      {/* Global Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

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
