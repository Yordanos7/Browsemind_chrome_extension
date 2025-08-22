import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import {
  getBlockedSites,
  addBlockedSite,
  removeBlockedSite,
  getDailyLimit,
  setDailyLimit,
  getFocusDuration,
  setFocusDuration,
} from "../utils/storage";
import Dashboard from "./Dashboard"; // Import Dashboard component

const Options: React.FC = () => {
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [newSite, setNewSite] = useState("");
  const [dailyLimit, setDailyLimitState] = useState(120);
  const [focusDuration, setFocusDurationState] = useState(25);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setShowStats(window.location.hash === "#stats");
    };

    handleHashChange(); // Set initial state
    window.addEventListener("hashchange", handleHashChange);
    loadSettings();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const loadSettings = async () => {
    const sites = await getBlockedSites();
    const limit = await getDailyLimit();
    const duration = await getFocusDuration();

    setBlockedSites(sites);
    setDailyLimitState(limit);
    setFocusDurationState(duration);
  };

  const handleAddSite = async () => {
    if (newSite.trim() && !blockedSites.includes(newSite.trim())) {
      await addBlockedSite(newSite.trim());
      setBlockedSites([...blockedSites, newSite.trim()]);
      setNewSite("");
    }
  };

  const handleRemoveSite = async (site: string) => {
    await removeBlockedSite(site);
    setBlockedSites(blockedSites.filter((s) => s !== site));
  };

  const handleDailyLimitChange = async (limit: number) => {
    await setDailyLimit(limit);
    setDailyLimitState(limit);
  };

  const handleFocusDurationChange = async (duration: number) => {
    await setFocusDuration(duration);
    setFocusDurationState(duration);
  };

  if (showStats) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blocked Sites */}
          <Card title="Blocked Websites" className="md:col-span-2">
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  placeholder="Enter website URL (e.g., facebook.com)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleAddSite}>Add Site</Button>
              </div>
            </div>

            <div className="space-y-2">
              {blockedSites.map((site) => (
                <div
                  key={site}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm">{site}</span>
                  <Button
                    variant="secondary"
                    onClick={() => handleRemoveSite(site)}
                    className="text-xs py-1"
                  >
                    Remove
                  </Button>
                </div>
              ))}

              {blockedSites.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No blocked sites yet
                </p>
              )}
            </div>
          </Card>

          {/* Daily Limit */}
          <Card title="Daily Time Limit">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum daily browsing (minutes)
                </label>
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) =>
                    handleDailyLimitChange(Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="30"
                  max="600"
                />
              </div>
              <p className="text-sm text-gray-600">
                Currently: {Math.floor(dailyLimit / 60)}h {dailyLimit % 60}m per
                day
              </p>
            </div>
          </Card>

          {/* Focus Session */}
          <Card title="Focus Session Duration">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus session length (minutes)
                </label>
                <input
                  type="number"
                  value={focusDuration}
                  onChange={(e) =>
                    handleFocusDurationChange(Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="120"
                />
              </div>
              <p className="text-sm text-gray-600">
                Current: {focusDuration} minutes per focus session
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Options;
