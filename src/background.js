// background.js
// background.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'captureScreenshot') {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({error: '截图失败: ' + chrome.runtime.lastError.message});
      } else {
        sendResponse({dataUrl});
      }
    });
    return true;
  }
});
