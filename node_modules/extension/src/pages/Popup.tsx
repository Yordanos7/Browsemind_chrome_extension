import React, { useState, useEffect } from "react";
import { AlertCircle, Settings, BarChart3 } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import {
  getStorageData, // Import getStorageData to fetch all settings
  toggleFocusMode,
} from "../utils/storage";

const Popup: React.FC = () => {
  const [dailyUsageData, setDailyUsageData] = useState<{
    [date: string]: {
      [site: string]: number;
    };
  }>({});
  const [blockedSitesList, setBlockedSitesList] = useState<string[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    loadData();

    // Add a listener for storage changes
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.blockedSites || changes.usageData || changes.focusMode) {
        loadData(); // Reload data if relevant storage items change to update the function of the components
      }
    };

    chrome.storage.sync.onChanged.addListener(handleStorageChange);

    // Clean up the listener when the component unmounts this is for avoiding memory leaks
    return () => {
      chrome.storage.sync.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadData = async () => {
    const settings = await getStorageData(); // Fetch all settings
    const today = new Date().toDateString();

    setDailyUsageData(
      settings.usageData[today]
        ? { [today]: settings.usageData[today] }
        : { [today]: {} }
    ); // Get today's usage data
    setBlockedSitesList(settings.blockedSites); // Get the actual blocked sites list
    setIsFocusMode(settings.focusMode);
  };

  const handleToggleFocus = async () => {
    await toggleFocusMode();
    setIsFocusMode(!isFocusMode);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Calculate total blocked sites count for display
  const totalBlockedSitesCount = blockedSitesList.length;

  return (
    <div className="w-100 p-4 bg-gray-800  text-white">
      <div className="flex items-center mb-4 justify-between text-white">
        <div className="flex">
          <BarChart3 className="text-blue-600 mr-2" size={24} />
          <h1 className="text-xl font-bold ">BrowseMind</h1>
        </div>
      </div>

      <Card title="Today's Browsing" className="mb-4">
        <div className="flex items-center">
          <div>
            {Object.keys(dailyUsageData).length > 0 &&
            Object.keys(dailyUsageData[new Date().toDateString()] || {})
              .length > 0 ? (
              <ul className="list-disc pl-5">
                {Object.entries(
                  dailyUsageData[new Date().toDateString()] || {}
                ).map(([site, minutes]) => (
                  <li key={site} className="mb-1">
                    <span className="font-semibold">{site}:</span>{" "}
                    {formatTime(minutes)}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-600">No sites visited today</span>
            )}
          </div>
        </div>
      </Card>

      <Card title="Focus Mode" className="mb-4">
        <div className="flex items-center justify-between">
          <span
            className={
              isFocusMode ? "text-green-600 font-medium" : "text-gray-600"
            }
          >
            {isFocusMode ? "Active" : "Inactive"}
          </span>
          <Button
            onClick={handleToggleFocus}
            variant={isFocusMode ? "secondary" : "primary"}
          >
            {isFocusMode ? "Turn Off" : "Turn On"}
          </Button>
        </div>
      </Card>

      <Card title="Blocked Sites" className="mb-4">
        <div className="flex items-center">
          <AlertCircle className="text-red-500 mr-2" size={20} />
          <span>{totalBlockedSitesCount} sites blocked</span>
        </div>
        <ul className="list-disc pl-5 ml-2">
          {blockedSitesList.length > 0 ? (
            blockedSitesList.map((site) => (
              <li key={site} className="mb-1">
                <span className="font-semibold">{site}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-600">No sites blocked</li>
          )}
        </ul>
        <div>
          <span className="text-blue-500 ">More</span>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => chrome.tabs.create({ url: "options.html#/options" })}
          className="flex items-center"
        >
          <Settings size={16} className="mr-1" />
          Settings
        </Button>
        <Button
          onClick={() =>
            chrome.tabs.create({
              url: chrome.runtime.getURL("options.html") + "#/stats",
            })
          }
        >
          View Stats
        </Button>
      </div>
    </div>
  );
};

export default Popup;
