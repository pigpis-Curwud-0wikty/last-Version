import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `https://e-commerce-api-v1-p515.onrender.com/api/Account/login`,
        { email, password }
      );

      console.log("Full API Response:", response.data);

      const statusCode = response.data.statuscode;
      const body = response.data.responseBody;

      if (statusCode === 200 && body?.data?.token) {
        const token = body.data.token;
        setToken(token);
        localStorage.setItem("token", token);
        toast.success(body.message || "Login successful");
      } else {
        console.warn("⚠️ Login failed:", response.data);
        toast.error(body?.message || "Login failed");
      }
    } catch (error) {
      console.error("Axios Error:", error);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        toast.error(
          error.response.data?.message ||
            `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server");
      } else {
        console.error("Error setting up request:", error.message);
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </p>
            <input
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
              type="email"
              placeholder="Enter Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">Password</p>
            <input
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
              type="password"
              placeholder="Enter Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-md w-full cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
