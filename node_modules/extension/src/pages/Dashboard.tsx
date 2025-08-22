import { useState, useEffect } from "react"; // Removed React import as it's not directly used in JSX
import { getStorageData } from "../utils/storage";
import { formatTime } from "../utils/formatTime"; // Assuming this utility exists

function Dashboard() {
  const [usageData, setUsageData] = useState<{ [date: string]: number }>({});
  const [totalBrowsingTime, setTotalBrowsingTime] = useState(0);
  const [averageDailyTime, setAverageDailyTime] = useState(0);

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    const settings = await getStorageData();
    const data = settings.usageData || {};
    setUsageData(data);

    const dates = Object.keys(data);
    const totalMinutes = Object.values(data).reduce(
      (sum, minutes) => sum + minutes,
      0
    );
    setTotalBrowsingTime(totalMinutes);

    if (dates.length > 0) {
      setAverageDailyTime(totalMinutes / dates.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Browsing Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Total Browsing Time
          </h3>
          <p className="text-4xl font-bold text-blue-600">
            {formatTime(totalBrowsingTime)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Average Daily Time
          </h3>
          <p className="text-4xl font-bold text-green-600">
            {formatTime(averageDailyTime)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Days Tracked
          </h3>
          <p className="text-4xl font-bold text-purple-600">
            {Object.keys(usageData).length}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Daily Usage Breakdown
        </h3>
        {Object.keys(usageData).length > 0 ? (
          <ul className="space-y-2">
            {Object.entries(usageData)
              .sort(
                ([dateA], [dateB]) =>
                  new Date(dateB).getTime() - new Date(dateA).getTime()
              ) // Sort by date descending
              .map(([date, minutes]) => (
                <li
                  key={date}
                  className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                >
                  <span className="font-medium text-gray-700">{date}</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatTime(minutes)}
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500">No browsing data available yet.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
