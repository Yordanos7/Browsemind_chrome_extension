const showBlockedWarning = () => {
  const overlay = document.createElement("div");
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
    margin-bottom: 20px; /* Corrected mergin-bottom to margin-bottom */
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
       <p>Redirecting in <span id="countdown-text">5</span> seconds...</p>
`; // Changed id="count" to id="countdown-text"

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

// The background script injects this content script when a site is blocked and focus mode is on.
// So, we can directly call showBlockedWarning when the script loads.
showBlockedWarning();
