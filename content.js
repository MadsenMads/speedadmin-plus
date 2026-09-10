const SUMMER_MINUTES_LABEL = "Summer Antal minutter";
const HOURS_CONVERTED_ATTRIBUTE = "data-hours-converted";
let enabled = true;
let summerMinutesObserver = null;

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function findSummerMinutesValue(label) {
  const row = label.parentElement;
  if (!row) return null;

  return Array.from(row.children).find(
    (element) =>
      element !== label &&
      element.matches("div") &&
      normalizeText(element.textContent)
  );
}

function convertSummerMinutesToHours(root = document) {
  if (!enabled) return;

  const labels = root.querySelectorAll(
    ".RowHeader.rowGrouping.pull-right label"
  );

  labels.forEach((label) => {
    if (normalizeText(label.textContent) !== SUMMER_MINUTES_LABEL) return;

    const valueElement = findSummerMinutesValue(label);
    if (!valueElement || valueElement.getAttribute(HOURS_CONVERTED_ATTRIBUTE)) {
      return;
    }

    const minutesText = normalizeText(valueElement.textContent);
    const minutes = Number(minutesText.replace(",", "."));
    if (!Number.isFinite(minutes)) return;

    valueElement.textContent = `${minutesText} minutter = ${(minutes / 60).toFixed(2)} timer`;
    valueElement.setAttribute(HOURS_CONVERTED_ATTRIBUTE, "true");
  });
}

function restoreOriginalMinutes() {
  document.querySelectorAll(`[${HOURS_CONVERTED_ATTRIBUTE}]`).forEach((element) => {
    element.textContent = normalizeText(element.textContent).split(" minutter = ")[0];
    element.removeAttribute(HOURS_CONVERTED_ATTRIBUTE);
  });
}

function setEnabled(value) {
  enabled = value;

  if (enabled) {
    convertSummerMinutesToHours();
    if (!summerMinutesObserver) {
      summerMinutesObserver = new MutationObserver(() => {
        convertSummerMinutesToHours();
      });
      summerMinutesObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
  } else {
    summerMinutesObserver?.disconnect();
    summerMinutesObserver = null;
    restoreOriginalMinutes();
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "setEnabled") {
    setEnabled(message.enabled);
  }
});

chrome.storage.local.get(["enabled"], (result) => {
  setEnabled(result.enabled !== false);
});
