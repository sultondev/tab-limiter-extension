// Get delay from URL parameter or default to 6
const urlParams = new URLSearchParams(window.location.search);
let countdown = parseInt(urlParams.get('delay')) || 6;
let timerId;

const countdownElement = document.getElementById('countdown');
const secondsElement = document.getElementById('seconds');
const keepTabButton = document.getElementById('keepTab');

// Update initial display
countdownElement.textContent = countdown;
secondsElement.textContent = countdown;

function updateTimer() {
    countdown--;
    countdownElement.textContent = countdown;
    secondsElement.textContent = countdown;

    if (countdown <= 0) {
        clearInterval(timerId);
        window.close();
    }
}

// Start countdown
timerId = setInterval(updateTimer, 1000);

// Keep tab button
keepTabButton.addEventListener('click', () => {
    clearInterval(timerId);
    chrome.runtime.sendMessage({ action: 'keepTab' }, () => {
        history.back();
    });
});