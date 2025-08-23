// this background script is responsible for handling the background tasks of the extension, such as listening for messages and managing the state of blocked sites.

// here i set the defult values of extension settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    blockedSites: [],
    dailyLimit: 120,
    focusMode: false,
    focusDuration: 25,
    usageData: {},
  });
});

// this background script listens for messages from the content script or popup and handles them accordingly

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // Renamed 'sender' to '_sender'
  switch (request.type) {
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
  }
});

const handleTimeSpent = async (timeSpent: number, url: string) => {
  console.log(`Time spent on ${url}: ${timeSpent} seconds`);

  // Convert seconds to minutes and update storage
  const minutes = Math.round(timeSpent / 60);
  if (minutes > 0) {
    const today = new Date().toDateString();
    const data = await chrome.storage.sync.get(["usageData"]);
    const currentUsage = data.usageData[today] || 0;
    const updatedUsage = { ...data.usageData, [today]: currentUsage + minutes };

    await chrome.storage.sync.set({ usageData: updatedUsage });

    // Check if daily limit is exceeded
    const dailyLimit =
      (await chrome.storage.sync.get(["dailyLimit"])).dailyLimit || 120;
    if (currentUsage + minutes >= dailyLimit) {
      showDailyLimitNotification();
    }
  }
};

// and this is for check if the current site is blocked

const checkBlockedSite = async (urlHostname: string): Promise<boolean> => {
  const data = await chrome.storage.sync.get(["blockedSites", "focusMode"]);
  const blockedSites: string[] = data.blockedSites || [];
  const focusMode = data.focusMode || false;

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
  console.log("Is Blocked Result:", isBlockedResult);
  return isBlockedResult;
};

// this is for show notification if the daily limit is exceeded
const showDailyLimitNotification = () => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon48.png"),
    title: "BrowseMind - Daily Limit Reached",
    message: "You have reached your daily browsing time limit.",
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
