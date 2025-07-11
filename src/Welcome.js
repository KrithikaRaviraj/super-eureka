import React, { useState } from "react";
import { useLocation } from "react-router-dom";

export default function Welcome() {
  const location = useLocation();
  const [name, setName] = useState(location.state?.name || "");
  const [email, setEmail] = useState(location.state?.email || "");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">
        Hello, {name || email || "User"}!
      </h1>
      <form className="flex flex-col items-center">
        <label className="mb-2">Name:</label>
        <input
          className="mb-4 px-4 py-2 border rounded"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <label className="mb-2">Email:</label>
        <input
          className="mb-4 px-4 py-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {/* Add more fields as needed */}
      </form>
    </div>
  );
}