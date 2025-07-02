import React, { useState } from "react";
import logo from "./logo.svg"; // Use your own logo if available

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "min-h-screen bg-gray-900 text-white" : "min-h-screen bg-white text-gray-900"}>
      <header className="flex items-center justify-between px-8 py-4 shadow">
        {/* Centered logo and name */}
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col items-center">
            <img src={logo} alt="Salon Logo" className="h-14 w-14 mb-1" />
            <span className="font-bold text-xl text-center">Lavish Ladies Beauty Salon & Spa</span>
          </div>
        </div>
        {/* Right side: Login and toggle */}
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 rounded bg-pink-500 text-white text-base font-semibold hover:bg-pink-600 transition">
            Login
            <span className="ml-2 text-xl">👤</span>
          </button>
          <button
            className={`flex items-center px-3 py-2 rounded-full transition-colors duration-300 ${
              darkMode ? "bg-gray-700 text-yellow-200" : "bg-gray-200 text-yellow-600"
            }`}
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label="Toggle dark mode"
          >
            <span className="text-xl">{darkMode ? "🌙" : "☀️"}</span>
            <span className="ml-2 text-sm font-medium">{darkMode ? "Dark" : "Light"}</span>
          </button>
        </div>
      </header>
      {/* Add your main content here */}
    </div>
  );
}

export default App;