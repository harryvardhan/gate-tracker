import React from "react";

const ProgressGraph = ({ label, percent }) => {
  const bars = Math.round(percent / 10); // 10 bars max
  return (
    <div className="bg-white shadow-md rounded-xl p-4">
      <div className="flex justify-between mb-1">
        <span className="font-semibold text-gray-800">{label}</span>
        <span className="text-gray-700 font-semibold">{Math.round(percent)}%</span>
      </div>

      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-3 bg-orange-600 rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex gap-1 mt-2">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded ${
              i < bars ? "bg-orange-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressGraph;
