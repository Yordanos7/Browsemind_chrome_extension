let startTime: number;
let isTracking = false;

const startTracking = () => {
  if (!isTracking) return;
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

window.addEventListener("beforeunload", stopTracking); // this means when the user is about to leave the page, we stop tracking the time spent on the page
window.addEventListener("unload", stopTracking); // this means when the user is leaving the page, we stop tracking the time spent on the page

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    stopTracking();
  } else if (document.visibilityState === "visible") {
    startTracking();
  }
}); // this means when the user switches to another tab or minimizes the browser, we stop tracking the time spent on the page, and when the user comes back to the page, we start tracking again
