// Get the blocked URL from query parameter
const urlParams = new URLSearchParams(window.location.search);
const blockedUrl = urlParams.get('url');

// Display the blocked URL
if (blockedUrl) {
    document.getElementById('blockedUrl').textContent = decodeURIComponent(blockedUrl);
} else {
    document.getElementById('blockedUrl').textContent = 'Unknown URL';
}

// Go back button
document.getElementById('goBack').addEventListener('click', () => {
    window.history.back();
});

// Open settings button
document.getElementById('openSettings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage ? chrome.runtime.openOptionsPage() : window.open(chrome.runtime.getURL('popup.html'));
});