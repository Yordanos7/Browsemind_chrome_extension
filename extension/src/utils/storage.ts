export interface Settings {
  blockedSites: string[];
  dailyLimit: number;
  focusDuration: number;
  focusMode: boolean;
  usageData: {
    [date: string]: {
      [site: string]: number;
    };
  };
  authToken?: string; // Add authToken to settings
}

// this is the defult setting for the extension in case the user has not yet set any settings
const defultSettings: Settings = {
  blockedSites: [],
  dailyLimit: 120, // in minutes
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
};

export const getDailyLimit = async (): Promise<number> => {
  const data = await getStorageData();
  return data.dailyLimit;
};

export const setDailyLimit = async (limit: number): Promise<void> => {
  await setStorageData({ dailyLimit: limit });
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
