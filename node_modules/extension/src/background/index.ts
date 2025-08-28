import { updateTodayUsage, getStorageData } from "../utils/storage";

// this background script is responsible for handling the background tasks of the extension, such as listening for messages and managing the state of blocked sites.

// here i set the defult values of extension settings
chrome.runtime.onInstalled.addListener(async () => {
  const defaultSettings = {
    blockedSites: [],
    globalDailyLimit: 120, // Renamed from dailyLimit
    siteDailyLimits: {}, // New: Initialize as empty object
    focusMode: false,
    focusDuration: 25,
    usageData: {},
    authToken: undefined,
  };
  await chrome.storage.sync.set(defaultSettings);
});

// this background script listens for messages from the content script or popup and handles them accordingly

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // Renamed 'sender' to '_sender'
  switch (request.type) {
    case "TRACKING_STOPPED": // Handle the TRACKING_STOPPED message
      handleTimeSpent(request.url, request.timespent); // Call handleTimeSpent with url and timespent
      sendResponse({ success: true });
      break;

    case "Time_SPENT":
      handleTimeSpent(request.timeSpent, request.url);
      sendResponse({ success: "true" });
      break;

    case "CHECK_BLOCKED_SITES":
      checkBlockedSite(request.url).then((isBlocked) => {
        sendResponse({ isBlocked });
      });
      break;
    case "OPEN_OPTIONS":
      chrome.runtime.openOptionsPage();
      sendResponse({ success: "true" });
      break;

    case "TRACKING_STARTED":
      console.log("Tracking started for:", request.url);
      sendResponse({ success: "true" });
      break;
    case "OPEN_POPUP_PAGE":
      chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        width: 400,
        height: 600,
      });
      sendResponse({ success: true });
      break;

    case "CHECK_DAILY_LIMIT_BLOCK":
      checkDailyLimitAndBlock(request.url, request.tabId).then((isBlocked) => {
        sendResponse({ isBlocked });
      });
      break;
  }
});

const handleTimeSpent = async (url: string, timeSpent: number) => {
  // Swapped parameter order to match request
  console.log(`Time spent on ${url}: ${timeSpent} seconds`);

  // Extract hostname from the URL
  let hostname = "";
  try {
    const urlObj = new URL(url);
    hostname = urlObj.hostname;
  } catch (error) {
    console.error("Invalid URL for tracking:", url);
    return;
  }

  // Convert seconds to minutes and update storage
  const minutes = Math.round(timeSpent / 60);
  if (minutes > 0 && hostname) {
    await updateTodayUsage(hostname, minutes);

    // Check if daily limit is exceeded (site-specific and global)
    const settings = await getStorageData();
    const globalDailyLimit = settings.globalDailyLimit || 120;
    const siteDailyLimits = settings.siteDailyLimits || {};
    const siteSpecificLimit = siteDailyLimits[hostname];

    const todayUsage = settings.usageData[new Date().toDateString()] || {};
    const currentSiteUsage = todayUsage[hostname] || 0;
    const totalMinutesToday = Object.values(todayUsage).reduce(
      (sum: number, siteMinutes) => sum + (siteMinutes as number),
      0
    );

    // Site-specific limit check
    if (siteSpecificLimit !== undefined) {
      if (currentSiteUsage >= siteSpecificLimit) {
        showSiteBlockedNotification(hostname, "site-specific");
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tabs.length > 0 && tabs[0].id && tabs[0].url) {
          await checkDailyLimitAndBlock(tabs[0].url, tabs[0].id);
        }
      } else if (
        currentSiteUsage >= siteSpecificLimit - 5 &&
        currentSiteUsage < siteSpecificLimit
      ) {
        showWarningNotification(hostname, siteSpecificLimit - currentSiteUsage);
      }
    }

    // Global daily limit check (only if no site-specific limit is active or exceeded)
    if (totalMinutesToday >= globalDailyLimit) {
      showSiteBlockedNotification(hostname, "global");
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length > 0 && tabs[0].id && tabs[0].url) {
        await checkDailyLimitAndBlock(tabs[0].url, tabs[0].id);
      }
    }
  }
};

// and this is for check if the current site is blocked

const checkBlockedSite = async (urlHostname: string): Promise<boolean> => {
  const data = await getStorageData(); // getStorageData already returns Promise<Settings>
  const blockedSites: string[] = data.blockedSites || [];
  const focusMode = data.focusMode || false;
  const globalDailyLimit = data.globalDailyLimit || 120; // Default to 120 minutes
  const siteDailyLimits = data.siteDailyLimits || {};
  const siteSpecificLimit = siteDailyLimits[urlHostname];

  const today = new Date().toDateString();
  const todayUsage = data.usageData[today] || {};
  const currentSiteUsage = todayUsage[urlHostname] || 0;
  const totalMinutesToday = Object.values(todayUsage).reduce(
    (sum: number, siteMinutes) => sum + (siteMinutes as number),
    0
  );

  // Normalize the current URL's hostname (remove 'www.' if present)
  const normalizedUrlHostname = urlHostname.startsWith("www.")
    ? urlHostname.substring(4)
    : urlHostname;

  // Helper to check if a hostname matches any site in a given list
  const matchesSiteList = (list: string[]) => {
    return list.some((site) => {
      // Normalize the blocked site entry (remove 'www.' if present)
      const normalizedSite = site.startsWith("www.") ? site.substring(4) : site;
      // Check for exact match or subdomain match
      return (
        normalizedUrlHostname === normalizedSite ||
        normalizedUrlHostname.endsWith(`.${normalizedSite}`)
      );
    });
  };

  console.log("checkBlockedSite called for:", urlHostname);
  console.log("Focus Mode:", focusMode);
  console.log("Blocked Sites (from storage):", blockedSites);
  console.log("Normalized URL Hostname:", normalizedUrlHostname);

  let isBlockedResult: boolean;
  if (focusMode) {
    // In Focus Mode: Block all sites EXCEPT those in blockedSites (allow list)
    // So, if the current site is NOT in the blockedSites list, it IS blocked.
    isBlockedResult = !matchesSiteList(blockedSites);
  } else {
    // Focus Mode OFF: Block only sites explicitly listed in blockedSites (block list)
    isBlockedResult = matchesSiteList(blockedSites);
  }
  // Check site-specific limit first
  if (
    siteSpecificLimit !== undefined &&
    currentSiteUsage >= siteSpecificLimit
  ) {
    console.log(
      `Site-specific limit exceeded for ${urlHostname}. Blocking site.`
    );
    isBlockedResult = true;
  }
  // If not blocked by site-specific limit, check global daily limit
  else if (totalMinutesToday >= globalDailyLimit) {
    console.log("Global daily limit exceeded. Blocking site.");
    isBlockedResult = true;
  }

  console.log("Is Blocked Result:", isBlockedResult);
  return isBlockedResult;
};

const showWarningNotification = (
  hostname: string,
  minutesRemaining: number
) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon48.png"),
    title: "BrowseMind - Time Limit Warning",
    message: `You have ${minutesRemaining} minutes left on ${hostname} today.`,
    priority: 1,
  });
};

const showSiteBlockedNotification = (
  hostname: string,
  limitType: "site-specific" | "global"
) => {
  const message =
    limitType === "site-specific"
      ? `You have reached your daily time limit for ${hostname}.`
      : `You have reached your global daily browsing time limit.`;

  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon48.png"),
    title: "BrowseMind - Site Blocked",
    message: message,
    priority: 2,
  });
};

// this ia for handling updates to chuck for blocked sites

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    try {
      const url = new URL(tab.url);
      const isBlocked = await checkBlockedSite(url.hostname);

      if (isBlocked) {
        // Inject the content script to show blocking page
        chrome.scripting.executeScript({
          target: { tabId },
          files: ["content/blockSites.js"], // Corrected path
        });

        // Determine the reason for blocking
        const data = await chrome.storage.sync.get([
          "globalDailyLimit",
          "siteDailyLimits",
          "usageData",
          "blockedSites",
          "focusMode",
        ]);
        const globalDailyLimit = data.globalDailyLimit || 120;
        const siteDailyLimits = data.siteDailyLimits || {};
        const siteSpecificLimit = siteDailyLimits[url.hostname];
        const today = new Date().toDateString();
        const todayUsage = data.usageData[today] || {};
        const currentSiteUsage = todayUsage[url.hostname] || 0;
        const totalMinutesToday = Object.values(todayUsage).reduce(
          (sum: number, siteMinutes) => sum + (siteMinutes as number),
          0
        );

        let reason = "unknown";
        if (
          siteSpecificLimit !== undefined &&
          currentSiteUsage >= siteSpecificLimit
        ) {
          reason = "site_specific_limit_exceeded";
        } else if (totalMinutesToday >= globalDailyLimit) {
          reason = "global_daily_limit_exceeded";
        } else if (data.blockedSites.includes(url.hostname)) {
          reason = "explicitly_blocked";
        } else if (
          data.focusMode &&
          !data.blockedSites.includes(url.hostname)
        ) {
          reason = "focus_mode_active";
        }

        chrome.tabs.sendMessage(tabId, {
          type: "SHOW_BLOCKED_PAGE",
          reason: reason,
          hostname: url.hostname,
        });
      }
    } catch (error) {
      // Invalid URL, skip processing
    }
  }
});

// Check and enforce focus mode
const checkFocusModeStatus = async () => {
  const data = await chrome.storage.sync.get(["focusMode", "blockedSites"]);
  const focusMode: boolean = data.focusMode || false;
  //const blockedSites: string[] = data.blockedSites || [];

  if (focusMode) {
    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const currentTab = tabs[0];
      if (currentTab.url) {
        try {
          const url = new URL(currentTab.url);
          // Use the updated checkBlockedSite logic for consistency
          const isBlocked = await checkBlockedSite(url.hostname);

          if (isBlocked) {
            // Redirect to a productive site or show blocked page
            chrome.tabs.update(currentTab.id!, {
              url: "https://www.google.com",
            });
          }
        } catch (error) {
          // Invalid URL, skip processing
        }
      }
    }
  }
};

// Add a listener to enforce focus mode when the active tab changes
chrome.tabs.onActivated.addListener(() => {
  checkFocusModeStatus();
});

const checkDailyLimitAndBlock = async (
  url: string,
  tabId: number
): Promise<boolean> => {
  try {
    const urlObj = new URL(url);
    const isBlocked = await checkBlockedSite(urlObj.hostname);

    if (isBlocked) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["content/blockSites.js"],
      });

      // Determine the reason for blocking
      const data = await getStorageData(); // getStorageData already returns Promise<Settings>
      const globalDailyLimit = data.globalDailyLimit || 120;
      const siteDailyLimits = data.siteDailyLimits || {};
      const siteSpecificLimit = siteDailyLimits[urlObj.hostname];
      const today = new Date().toDateString();
      const todayUsage = data.usageData[today] || {};
      const currentSiteUsage = todayUsage[urlObj.hostname] || 0;
      const totalMinutesToday = Object.values(todayUsage).reduce(
        (sum: number, siteMinutes) => sum + (siteMinutes as number),
        0
      );

      let reason = "unknown";
      if (
        siteSpecificLimit !== undefined &&
        currentSiteUsage >= siteSpecificLimit
      ) {
        reason = "site_specific_limit_exceeded";
      } else if (totalMinutesToday >= globalDailyLimit) {
        reason = "global_daily_limit_exceeded";
      } else if (data.blockedSites.includes(urlObj.hostname)) {
        reason = "explicitly_blocked";
      } else if (
        data.focusMode &&
        !data.blockedSites.includes(urlObj.hostname)
      ) {
        reason = "focus_mode_active";
      }

      chrome.tabs.sendMessage(tabId, {
        type: "SHOW_BLOCKED_PAGE",
        reason: reason,
        hostname: urlObj.hostname,
      });
    }
    return isBlocked;
  } catch (error) {
    console.error("Error in checkDailyLimitAndBlock:", error);
    return false;
  }
};
