import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import {
  getBlockedSites,
  addBlockedSite,
  removeBlockedSite,
  getGlobalDailyLimit, // Renamed
  setGlobalDailyLimit, // Renamed
  // getSiteDailyLimit, // Removed as it's not directly used in Options.tsx
  setSiteDailyLimit, // New
  removeSiteDailyLimit, // New
  getFocusDuration,
  setFocusDuration,
  getFocusMode,
  toggleFocusMode,
  getStorageData, // Import getStorageData
} from "../utils/storage"; // Fixed import statement
import Dashboard from "./Dashboard"; // Import Dashboard component

const Options: React.FC = () => {
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [newSite, setNewSite] = useState("");
  const [globalDailyLimit, setGlobalDailyLimitState] = useState(120); // Renamed
  const [siteDailyLimits, setSiteDailyLimitsState] = useState<{
    [site: string]: number;
  }>({}); // New state for site-specific limits
  const [newSiteLimit, setNewSiteLimit] = useState(""); // New state for site input
  const [newLimitValue, setNewLimitValue] = useState(60); // New state for limit value input
  const [focusDuration, setFocusDurationState] = useState(25);
  const [focusMode, setFocusModeState] = useState(false); // Add state for focusMode
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
    const globalLimit = await getGlobalDailyLimit(); // Renamed
    const siteLimits = await getStorageData().then(
      (data) => data.siteDailyLimits || {}
    ); // Fetch site-specific limits
    const duration = await getFocusDuration();
    const mode = await getFocusMode(); // Get focus mode state

    setBlockedSites(sites);
    setGlobalDailyLimitState(globalLimit); // Renamed
    setSiteDailyLimitsState(siteLimits); // Set site-specific limits
    setFocusDurationState(duration);
    setFocusModeState(mode); // Set focus mode state
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

  const handleGlobalDailyLimitChange = async (limit: number) => {
    // Renamed
    await setGlobalDailyLimit(limit); // Renamed
    setGlobalDailyLimitState(limit); // Renamed
  };

  const handleFocusDurationChange = async (duration: number) => {
    await setFocusDuration(duration);
    setFocusDurationState(duration);
  };

  const handleToggleFocusMode = async () => {
    await toggleFocusMode();
    setFocusModeState((prevMode) => !prevMode); // Toggle focus mode state
  };

  const handleAddSiteLimit = async () => {
    if (newSiteLimit.trim() && newLimitValue > 0) {
      let normalizedSite = newSiteLimit.trim();
      try {
        const urlObj = new URL(
          normalizedSite.startsWith("http")
            ? normalizedSite
            : `https://${normalizedSite}`
        );
        normalizedSite = urlObj.hostname;
      } catch (error) {
        console.warn(
          "Could not parse site as URL, using as-is:",
          normalizedSite
        );
      }

      if (normalizedSite.startsWith("www.")) {
        normalizedSite = normalizedSite.substring(4);
      }

      await setSiteDailyLimit(normalizedSite, newLimitValue);
      setSiteDailyLimitsState((prevLimits) => ({
        ...prevLimits,
        [normalizedSite]: newLimitValue,
      }));
      setNewSiteLimit("");
      setNewLimitValue(60); // Reset to default
    }
  };

  const handleRemoveSiteLimit = async (site: string) => {
    await removeSiteDailyLimit(site);
    setSiteDailyLimitsState((prevLimits) => {
      const newLimits = { ...prevLimits };
      delete newLimits[site];
      return newLimits;
    });
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

          {/* Global Daily Limit */}
          <Card title="Global Daily Time Limit">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum daily browsing (minutes)
                </label>
                <input
                  type="number"
                  value={globalDailyLimit}
                  onChange={(e) =>
                    handleGlobalDailyLimitChange(Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="30"
                  max="600"
                />
              </div>
              <p className="text-sm text-gray-600">
                Currently: {Math.floor(globalDailyLimit / 60)}h{" "}
                {globalDailyLimit % 60}m per day
              </p>
            </div>
          </Card>

          {/* Site-Specific Time Limits */}
          <Card title="Site-Specific Time Limits">
            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSiteLimit}
                  onChange={(e) => setNewSiteLimit(e.target.value)}
                  placeholder="Enter website URL (e.g., youtube.com)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={newLimitValue}
                  onChange={(e) => setNewLimitValue(Number(e.target.value))}
                  placeholder="Minutes"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="1440"
                />
              </div>
              <Button onClick={handleAddSiteLimit}>Add Site Limit</Button>
            </div>

            <div className="space-y-2">
              {Object.entries(siteDailyLimits).map(([site, limit]) => (
                <div
                  key={site}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm">
                    {site}: {limit} minutes
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => handleRemoveSiteLimit(site)}
                    className="text-xs py-1"
                  >
                    Remove
                  </Button>
                </div>
              ))}

              {Object.keys(siteDailyLimits).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No site-specific limits set yet
                </p>
              )}
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

          {/* Focus Mode Toggle */}
          <Card title="Focus Mode">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Enable Focus Mode (Block all sites EXCEPT listed)
              </span>
              <label
                htmlFor="focus-mode-toggle"
                className="flex items-center cursor-pointer"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    id="focus-mode-toggle"
                    className="sr-only"
                    checked={focusMode}
                    onChange={handleToggleFocusMode}
                  />
                  <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                      focusMode ? "translate-x-full bg-blue-600" : ""
                    }`}
                  ></div>
                </div>
              </label>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {focusMode
                ? "Focus Mode is ON: Only sites in 'Blocked Websites' list are allowed."
                : "Focus Mode is OFF: Only sites in 'Blocked Websites' list are blocked."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Options;
