const showBlockedWarning = (reason: string, hostname: string) => {
  // Check if the overlay already exists to prevent multiple overlays
  if (document.getElementById("browsermind-block-overlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "browsermind-block-overlay"; // Add an ID for easy checking
  overlay.style.cssText = `
     position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column; /* Added for vertical alignment */
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: white;
      font-size: 24px;
      font-family: Arial, sans-serif;
      text-align: center;
     `;

  const countdown = document.createElement("div");
  countdown.id = "blocked-countdown";
  countdown.style.cssText = `
   font-size: 48px;
    font-weight: bold;
    margin-bottom: 20px;
    color:#ff4444;
    color:red;
`;
  countdown.textContent = "5";

  const message = document.createElement("div");
  message.style.cssText = `
  font-size: 24px;
  margin-bottom: 40px;
  max-width:60%;
  line-height: 1.5;
`;

  let blockingMessage = "";
  switch (reason) {
    case "site_specific_limit_exceeded":
      blockingMessage = `You have reached your daily time limit for ${hostname}.`;
      break;
    case "global_daily_limit_exceeded":
      blockingMessage = `You have reached your global daily browsing time limit.`;
      break;
    case "explicitly_blocked":
      blockingMessage = `This site (${hostname}) is explicitly blocked by BrowseMind.`;
      break;
    case "focus_mode_active":
      blockingMessage = `Focus Mode is active. This site (${hostname}) is not allowed.`;
      break;
    default:
      blockingMessage = `This site is blocked by BrowseMind.`;
  }

  message.innerHTML = `<h1>${blockingMessage}</h1>
       <p>Redirecting in <span id="countdown-text">5</span> seconds...</p>
`;

  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = `
    display: flex;
    gap:20px;
    margin-top: 20px;
    
`;

  const exitButton = document.createElement("button");
  exitButton.textContent = "Exit Now";
  exitButton.style.cssText = `
    padding: 10px 20px;
    border: none; /* Corrected bordder to border */
    text-decoration: none;
    background-color: #ff4444;
    border-radius: 5px;
    cursor: pointer; /* Added cursor style */
`;
  exitButton.onclick = () => {
    window.location.href = "https://www.google.com";
  };

  const settingsButton = document.createElement("button");
  settingsButton.textContent = "Settings";
  settingsButton.style.cssText = `
    padding: 10px 20px;
    border: none;
    text-decoration: none;
    background-color: #007bff;
    color: white;
    border-radius: 5px;
    cursor: pointer; /* Added cursor style */
`;
  settingsButton.onclick = () => {
    chrome.runtime.sendMessage({
      type: "OPEN_OPTIONS", // Corrected " OPEN_OPTIONS" to "OPEN_OPTIONS"
    });
  };

  // HERE we append the elements to the overlay

  buttonContainer.appendChild(exitButton);
  buttonContainer.appendChild(settingsButton);
  overlay.appendChild(countdown); // Keep this for the initial 5
  overlay.appendChild(message); // This contains the span with countdown-text
  overlay.appendChild(buttonContainer);
  document.body.appendChild(overlay);

  //here start count down

  let seconds = 5;
  const countdownInterval = setInterval(() => {
    seconds--;

    if (seconds <= 0) {
      clearInterval(countdownInterval);
      window.location.href = "https://www.google.com";
    } else {
      // Update both the main countdown div and the span inside the message
      countdown.textContent = seconds.toString();
      const countdownTextSpan = document.getElementById("countdown-text");
      if (countdownTextSpan) {
        countdownTextSpan.textContent = seconds.toString();
      }
    }
  }, 1000);
};

// The background script injects this content script when a site is blocked.
// It then sends a message with the blocking reason.
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "SHOW_BLOCKED_PAGE") {
    showBlockedWarning(request.reason, request.hostname);
  }
});
