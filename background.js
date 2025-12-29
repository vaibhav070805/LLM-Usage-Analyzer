chrome.runtime.onInstalled.addListener(() => {
  console.log("[LLM Analyzer] Extension installed successfully");
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  if (changes.directCodeRequests) {
    const count = changes.directCodeRequests.newValue || 0;

    if (count >= 1) {
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: "#ff7043" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  }
});
