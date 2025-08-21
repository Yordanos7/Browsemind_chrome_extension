import React, { useState, useEffect } from "react";
import { Clock, AlertCircle, Settings, BarChart3 } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import {
  getTodayUsage,
  getBlockedSites,
  toggleFocusMode,
  getFocusMode,
} from "../utils/storage";
import { login } from "../utils/api";
import type { User } from "../types";

const Popup: React.FC = () => {
  const [todayUsage, setTodayUsage] = useState(0);
  const [blockedSitesCount, setBlockedSitesCount] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const usage = await getTodayUsage();
    const blockedSites = await getBlockedSites();
    const focusMode = await getFocusMode();

    setTodayUsage(usage);
    setBlockedSitesCount(blockedSites.length);
    setIsFocusMode(focusMode);
  };

  const handleToggleFocus = async () => {
    await toggleFocusMode();
    setIsFocusMode(!isFocusMode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { user } = await login({ email, password });
      setUser(user);
      // In a real app, you'd store the token securely
      console.log("Logged in successfully:", user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // here the sites are hardcoded for demonstration purposes
  const sampleforSites = {
    "example.com": 120,
    "testsite.org": 45,
    "sample.net": 30,
  };

  // here is also a hardcoded count of blocked sites for demonstration purposes
  const sampleBlockedSitesCount = {
    "example.com": 1,
    "testsite.org": 2,
    "sample.net": 3,
  };

  return (
    <div className="w-100 p-4 bg-gray-800 rounded-2xl text-white">
      <div className="flex items-center mb-4 justify-between text-white">
        <div className="flex">
          <BarChart3 className="text-blue-600 mr-2" size={24} />
          <h1 className="text-xl font-bold ">BrowseMind</h1>
        </div>
        <div className="text-sm">
          {user ? (
            <div>Hi, {user.email}</div>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="mb-1 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="mb-1 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
              />
              <Button type="submit" variant="primary">
                Sign In
              </Button>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </form>
          )}
        </div>
      </div>

      <Card title="Today's Browsing" className="mb-4">
        <div className="flex items-center">
          <div>
            {sampleforSites && Object.keys(sampleforSites).length > 0 ? (
              <ul className="list-disc pl-5">
                {Object.entries(sampleforSites).map(([site, minutes]) => (
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
          <span>{blockedSitesCount} sites blocked</span>
        </div>
        <ul className="list-disc pl-5 ml-2">
          {Object.entries(sampleBlockedSitesCount).map(([site, count]) => (
            <li key={site} className="mb-1">
              <span className="font-semibold">{site}:</span> {count} times
            </li>
          ))}
        </ul>
        <div>
          <span className="text-blue-500 ">More</span>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() =>
            chrome.tabs.create({ url: "/src/pages/Options/index.html" })
          }
          className="flex items-center"
        >
          <Settings size={16} className="mr-1" />
          Settings
        </Button>
        <Button
          onClick={() =>
            chrome.tabs.create({
              url:
                chrome.runtime.getURL("src/pages/Options/index.html") +
                "#stats",
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
