const checkBolockedSites = async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "CHECK_BLOCKED_SITES",
      url: window.location.hostname,
    });
    if (response?.isBlocked) {
      // Redirect to a blocked page or show a message
      showBlockedWarning();
    }
  } catch (error) {
    console.error("Error checking blocked sites:", error);
  }
};

const showBlockedWarning = () => {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
     postion: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: white;
      font-size: 24px;
      font-family: Arial, sans-serif;
      text-align: center;
     `;
};

const countdown = document.createElement("div");
countdown.id = "blocked-countdown";
countdown.style.cssText = `
   font-size: 48px;
    font-weight: bold;
    mergin-bottom: 20px;
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

message.innerHTML = `<h1>This site is blocked by BrowseMind</h1>
       <p>Redirecting in <span id="count">5</span> seconds...</p>
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
    bordder: none;
    text-decoration: none;
    background-color: #ff4444;
    border-radius: 5px;
`;
exitButton.onclick = () => {
  window.location.href = "https://www.google.com";
};

// and setting btn

const settingsButton = document.createElement("button");
settingsButton.textContent = "Settings";
settingsButton.style.cssText = `
    padding: 10px 20px;
    border: none;
    text-decoration: none;
    background-color: #007bff;
    color: white;
    border-radius: 5px;
`;
settingsButton.onclick = () => {
  chrome.runtime.sendMessage({
    type: " OPEN_OPTIONS", //OPEN_SETTINGS_PAGE
  });
};

// HERE we append the elements to the overlay

buttonContainer.appendChild(exitButton);
buttonContainer.appendChild(settingsButton);
overlay.appendChild(countdown);
overlay.appendChild(message);
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
    countdown.textContent = seconds.toString();
    document.getElementById("countdown-text")!.textContent = seconds.toString();
  }
}, 1000);

// Check if the current site is blocked
checkBolockedSites();
// here i do donot get where the countdown-text is coming
