import React from "react";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your personalized dashboard.</p>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widget 1 */}
        <div className="p-4 bg-white rounded-xl shadow border">
          <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
          <p className="text-sm text-gray-600 mt-2">Add your overview content here.</p>
        </div>

        {/* Widget 2 */}
        <div className="p-4 bg-white rounded-xl shadow border">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          <p className="text-sm text-gray-600 mt-2">Show recent actions or updates.</p>
        </div>

        {/* Widget 3 */}
        <div className="p-4 bg-white rounded-xl shadow border">
          <h2 className="text-lg font-semibold text-gray-800">Statistics</h2>
          <p className="text-sm text-gray-600 mt-2">Charts, numbers, or quick stats.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
