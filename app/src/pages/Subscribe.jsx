import { useState } from "react";
import toast from "react-hot-toast";

export default function Subscribe() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    plan: "basic",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(`Subscribed successfully! Plan: ${formData.plan}`); // ✅ toast
    // Optional: Save to backend/localStorage here
    setFormData({ fullName: "", email: "", plan: "basic" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Subscribe Now
        </h2>

        <p className="text-center text-gray-600 text-sm">
          Stay updated with our latest features and offers.
        </p>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          required
        />

        <select
          name="plan"
          value={formData.plan}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
        >
          <option value="basic">Basic - Free</option>
          <option value="pro">Pro - $9.99/month</option>
          <option value="premium">Premium - $19.99/month</option>
        </select>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Subscribe
        </button>

        <p className="text-center text-xs text-gray-500">
          You can cancel your subscription at any time.
        </p>
      </form>
    </div>
  );
}
