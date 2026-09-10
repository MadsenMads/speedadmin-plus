const enabledInput = document.getElementById("enabledInput");
const statusEl = document.getElementById("status");

function setStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });
}

async function setEnabledOnCurrentTab(enabled) {
  const tab = await getActiveTab();
  if (!tab || !tab.id) return;

  chrome.tabs.sendMessage(tab.id, { action: "setEnabled", enabled }, () => {
    if (chrome.runtime.lastError) return;
  });
}

enabledInput.addEventListener("change", () => {
  const enabled = enabledInput.checked;
  chrome.storage.local.set({ enabled }, async () => {
    setStatus(enabled ? "Enabled." : "Disabled.", "success");
    await setEnabledOnCurrentTab(enabled);
  });
});

chrome.storage.local.get(["enabled"], (result) => {
  enabledInput.checked = result.enabled !== false;
});
