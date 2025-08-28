export interface Settings {
  blockedSites: string[];
  globalDailyLimit: number; // Renamed from dailyLimit
  siteDailyLimits: {
    [site: string]: number;
  }; // New: Site-specific daily limits in minutes
  focusDuration: number;
  focusMode: boolean;
  usageData: {
    [date: string]: {
      [site: string]: number;
    };
  };
  authToken?: string; // Add authToken to settings
}

import { getBlockedSitesFromApi, syncBlockedSitesToApi } from "./api"; // Import API functions

// this is the defult setting for the extension in case the user has not yet set any settings
const defultSettings: Settings = {
  blockedSites: [],
  globalDailyLimit: 120, // in minutes, renamed from dailyLimit
  siteDailyLimits: {}, // New: Initialize as empty object
  focusDuration: 25, // in minutes
  focusMode: false,
  usageData: {},
  authToken: undefined, // Default to no token
};

export const getStorageData = async (): Promise<Settings> => {
  const result = await chrome.storage.sync.get(defultSettings);
  return result as Settings; // this mean we are returning the settings as Settings type
};

export const setStorageData = async (
  data: Partial<Settings>
): Promise<void> => {
  await chrome.storage.sync.set(data);
};

export const getBlockedSites = async (): Promise<string[]> => {
  const data = await getStorageData();
  const token = data.authToken;

  if (token) {
    try {
      const apiBlockedSites = await getBlockedSitesFromApi(token);
      // Update local storage with sites from API
      await setStorageData({ blockedSites: apiBlockedSites });
      return apiBlockedSites;
    } catch (error) {
      console.error(
        "Failed to fetch blocked sites from API, using local storage:",
        error
      );
      return data.blockedSites;
    }
  }
  return data.blockedSites;
};

export const addBlockedSite = async (site: string): Promise<void> => {
  const data = await getStorageData();
  let normalizedSite = site.trim();
  try {
    // Attempt to parse as a URL to extract hostname
    const urlObj = new URL(site.startsWith("http") ? site : `https://${site}`);
    normalizedSite = urlObj.hostname;
  } catch (error) {
    // If not a valid URL, use as is (e.g., "google.com")
    console.warn("Could not parse site as URL, using as-is:", site);
  }

  // Remove 'www.' prefix for consistency
  if (normalizedSite.startsWith("www.")) {
    normalizedSite = normalizedSite.substring(4);
  }

  if (normalizedSite && !data.blockedSites.includes(normalizedSite)) {
    const updatedSites = [...data.blockedSites, normalizedSite];
    await setStorageData({ blockedSites: updatedSites });

    const token = await getAuthToken();
    if (token) {
      try {
        await syncBlockedSitesToApi(token, updatedSites);
      } catch (error) {
        console.error("Failed to sync blocked site to API:", error);
      }
    }
  }
};

export const removeBlockedSite = async (site: string): Promise<void> => {
  const data = await getStorageData();
  let normalizedSite = site.trim();
  try {
    const urlObj = new URL(site.startsWith("http") ? site : `https://${site}`);
    normalizedSite = urlObj.hostname;
  } catch (error) {
    console.warn("Could not parse site as URL for removal, using as-is:", site);
  }

  if (normalizedSite.startsWith("www.")) {
    normalizedSite = normalizedSite.substring(4);
  }

  const updatedSites = data.blockedSites.filter((s) => s !== normalizedSite);
  await setStorageData({ blockedSites: updatedSites });

  const token = await getAuthToken();
  if (token) {
    try {
      await syncBlockedSitesToApi(token, updatedSites);
    } catch (error) {
      console.error("Failed to sync blocked site removal to API:", error);
    }
  }
};

export const getGlobalDailyLimit = async (): Promise<number> => {
  const data = await getStorageData();
  return data.globalDailyLimit;
};

export const setGlobalDailyLimit = async (limit: number): Promise<void> => {
  await setStorageData({ globalDailyLimit: limit });
};

export const getSiteDailyLimit = async (
  site: string
): Promise<number | undefined> => {
  const data = await getStorageData();
  return data.siteDailyLimits[site];
};

export const setSiteDailyLimit = async (
  site: string,
  limit: number
): Promise<void> => {
  const data = await getStorageData();
  const updatedSiteDailyLimits = {
    ...data.siteDailyLimits,
    [site]: limit,
  };
  await setStorageData({ siteDailyLimits: updatedSiteDailyLimits });
};

export const removeSiteDailyLimit = async (site: string): Promise<void> => {
  const data = await getStorageData();
  const updatedSiteDailyLimits = { ...data.siteDailyLimits };
  delete updatedSiteDailyLimits[site];
  await setStorageData({ siteDailyLimits: updatedSiteDailyLimits });
};

export const getFocusDuration = async (): Promise<number> => {
  const data = await getStorageData();
  return data.focusDuration;
};

export const setFocusDuration = async (duration: number): Promise<void> => {
  await setStorageData({ focusDuration: duration });
};
export const getFocusMode = async (): Promise<boolean> => {
  const data = await getStorageData();
  return data.focusMode;
};
export const toggleFocusMode = async (): Promise<void> => {
  const data = await getStorageData();
  await setStorageData({ focusMode: !data.focusMode });
};

export const getTodayUsage = async (): Promise<{ [site: string]: number }> => {
  const data = await getStorageData();
  const today = new Date().toDateString();
  return data.usageData[today] || {};
};

export const updateTodayUsage = async (
  site: string,
  additionalMinutes: number
): Promise<void> => {
  const data = await getStorageData();
  const today = new Date().toDateString();
  const todayUsage = data.usageData[today] || {};
  const currentSiteUsage = todayUsage[site] || 0;

  const updatedTodayUsage = {
    ...todayUsage,
    [site]: currentSiteUsage + additionalMinutes,
  };

  const updatedUsageData = {
    ...data.usageData,
    [today]: updatedTodayUsage,
  };
  await setStorageData({ usageData: updatedUsageData });
};

export const getAuthToken = async (): Promise<string | undefined> => {
  const data = await getStorageData();
  return data.authToken;
};

export const setAuthToken = async (
  token: string | undefined
): Promise<void> => {
  await setStorageData({ authToken: token });
};
