import { useState, useEffect } from "react";
import { getStorageData, getAuthToken } from "../utils/storage";
import { getBrowsingData } from "../utils/api";
import { formatTime } from "../utils/formatTime";
import SiteRow from "../components/SiteRow"; // Import SiteRow component

interface BrowsingActivity {
  id: string;
  date: string;
  minutes: number;
  domain: string;
  userId: string;
}

function Dashboard() {
  const [usageData, setUsageData] = useState<{ [date: string]: number }>({});
  const [detailedUsageData, setDetailedUsageData] = useState<
    BrowsingActivity[]
  >([]);
  const [totalBrowsingTime, setTotalBrowsingTime] = useState(0);
  const [averageDailyTime, setAverageDailyTime] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    const token = await getAuthToken();
    setIsLoggedIn(!!token);

    if (token) {
      try {
        const data: BrowsingActivity[] = await getBrowsingData(token);
        setDetailedUsageData(data);

        // Aggregate data for total and average from detailed data
        const aggregatedDailyData: { [date: string]: number } = {};
        let totalMinutes = 0;
        data.forEach((activity) => {
          const dateKey = new Date(activity.date).toDateString();
          aggregatedDailyData[dateKey] =
            (aggregatedDailyData[dateKey] || 0) + activity.minutes;
          totalMinutes += activity.minutes;
        });

        setUsageData(aggregatedDailyData);
        setTotalBrowsingTime(totalMinutes);

        const dates = Object.keys(aggregatedDailyData);
        if (dates.length > 0) {
          setAverageDailyTime(totalMinutes / dates.length);
        } else {
          setAverageDailyTime(0);
        }
      } catch (error) {
        console.error("Error fetching browsing data from API:", error);
        // Fallback to local storage if API fails
        const settings = await getStorageData();
        const localData = settings.usageData || {};
        setUsageData(localData);
        const dates = Object.keys(localData);
        const totalMinutes = Object.values(localData).reduce(
          (sum, minutes) => sum + minutes,
          0
        );
        setTotalBrowsingTime(totalMinutes);
        if (dates.length > 0) {
          setAverageDailyTime(totalMinutes / dates.length);
        } else {
          setAverageDailyTime(0);
        }
      }
    } else {
      // Load from local storage if not logged in
      const settings = await getStorageData();
      const localData = settings.usageData || {};
      setUsageData(localData);
      const dates = Object.keys(localData);
      const totalMinutes = Object.values(localData).reduce(
        (sum, minutes) => sum + minutes,
        0
      );
      setTotalBrowsingTime(totalMinutes);
      if (dates.length > 0) {
        setAverageDailyTime(totalMinutes / dates.length);
      } else {
        setAverageDailyTime(0);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Browsing Dashboard
      </h2>

      {!isLoggedIn && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">Login Required</p>
          <p>Please log in to view your detailed browsing statistics.</p>
          <a href="#/login" className="text-blue-500 hover:underline">
            Go to Login
          </a>
        </div>
      )}

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

      {isLoggedIn && detailedUsageData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Detailed Browsing Activity
          </h3>
          <div className="space-y-2">
            {detailedUsageData
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((activity) => (
                <SiteRow
                  key={activity.id}
                  host={activity.domain}
                  time={formatTime(activity.minutes)}
                />
              ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Daily Usage Breakdown (Aggregated)
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
