export interface Settings {
  blockedSites: string[];
  dailyLimit: number;
  focusDuration: number;
  focusMode: boolean;
  usageData: {
    [data: string]: number;
  };
}

// this is the defult setting for the extension in case the user has not yet set any settings
const defultSettings: Settings = {
  blockedSites: [],
  dailyLimit: 120, // in minutes
  focusDuration: 25, // in minutes
  focusMode: false,
  usageData: {},
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
  if (!data.blockedSites.includes(site)) {
    const updatedSites = [...data.blockedSites, site];
    await setStorageData({ blockedSites: updatedSites });
  }
};

export const removeBlockedSite = async (site: string): Promise<void> => {
  const data = await getStorageData();
  const updatedSites = data.blockedSites.filter((s) => s !== site);
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

export const getTodayUsage = async (): Promise<number> => {
  const data = await getStorageData();
  const today = new Date().toDateString();
  return data.usageData[today] || 0; // to tell you how this is work is like it returns the usage for today or 0 if there is no usage data for today
};

export const updateTodayUsage = async (
  additionalMinutes: number
): Promise<void> => {
  const data = await getStorageData();
  const today = new Date().toDateString();
  const currentUsage = data.usageData[today] || 0;
  const updatedUsage = {
    ...data.usageData,
    [today]: currentUsage + additionalMinutes,
  };
  await setStorageData({ usageData: updatedUsage });
};
