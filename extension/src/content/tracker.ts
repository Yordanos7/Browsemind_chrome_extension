let startTime: number;
let isTracking = false;

const startTracking = () => {
  // Removed the `if (!isTracking) return;` line to allow tracking to start
  startTime = Date.now();
  isTracking = true;

  chrome.runtime.sendMessage({
    type: "TRACKING_STARTED",
    url: window.location.href,
  });
};

const stopTracking = () => {
  if (!isTracking) return;
  const timespent = (Date.now() - startTime) / 1000; // this mean set the end time to the current time minus the start time in seconds  dividing with 1000 to convert milliseconds to seconds
  isTracking = false;
  chrome.runtime.sendMessage({
    type: "TRACKING_STOPPED",
    url: window.location.href,
    timespent,
  });
};

// and i write this for start tracking when the page loads

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startTracking);
} else {
  startTracking();
}

// Removed unload and beforeunload listeners due to Permissions Policy restrictions.
// The visibilitychange listener handles tracking when the tab is active or hidden.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    stopTracking();
  } else if (document.visibilityState === "visible") {
    startTracking();
  }
});
