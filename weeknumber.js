(function () {
  const TARGET_XPATH =
    "/html/body/div/div/div/div/div/div[3]/div[1]/div/div/div/div[2]/div[2]/div[2]/div[1]/div[2]/div/div[1]/div/div/div[1]/div/button[1]/span[2]";

  const BADGE_CLASS = "sa-week-number-badge";

  const MONTHS_DA = {
    jan: 0, januar: 0,
    feb: 1, februar: 1,
    mar: 2, marts: 2,
    apr: 3, april: 3,
    maj: 4,
    jun: 5, juni: 5,
    jul: 6, juli: 6,
    aug: 7, august: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };

  // Matches a Danish month name anywhere, longest names first so "august" wins over "aug".
  const MONTH_NAMES_RE = Object.keys(MONTHS_DA)
    .sort((a, b) => b.length - a.length)
    .join("|");
  const NAMED_DATE_RE = new RegExp(
    "(\\d{1,2})\\.?\\s*(" + MONTH_NAMES_RE + ")\\.?(?:\\s*(\\d{4}))?",
    "i"
  );

  let scheduled = false;
  let applying = false;
  let enabled = true;
  let observer = null;

  function getWeekNumber(date) {
    // ISO 8601 week number
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function parseDate(text) {
    if (!text) return null;
    const trimmed = text.trim();

    // Numeric formats: 21/8, 21-08-2026, 21.08.26
    let match = trimmed.match(/(\d{1,2})[.\/-](\d{1,2})(?:[.\/-](\d{2,4}))?/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      let year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
      if (year < 100) year += 2000;
      return new Date(year, month, day);
    }

    // Danish month name formats, e.g. "17. august 2026" or the first date of
    // a range like "mandag den 17. august 2026 - søndag den 23. august 2026"
    match = trimmed.match(NAMED_DATE_RE);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = MONTHS_DA[match[2].toLowerCase()];
      if (month === undefined) return null;
      const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
      return new Date(year, month, day);
    }

    return null;
  }

  // Numeric date patterns, e.g. "21/8", "21-08-2026", "21.08.26"
  const NUMERIC_DATE_RE = /\d{1,2}[.\/-]\d{1,2}([.\/-]\d{2,4})?/;

  function looksLikeDate(text) {
    if (!text) return false;
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 200) return false;
    return NUMERIC_DATE_RE.test(trimmed) || NAMED_DATE_RE.test(trimmed);
  }

  function getTargetElementByXPath() {
    const result = document.evaluate(
      TARGET_XPATH,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue;
  }

  // Fallback: the exact XPath is brittle since SpeedAdmin's DOM shifts
  // (extra wrappers/dialogs) between loads, so search by content instead.
  function findTargetByContent() {
    // Kendo UI (used by SpeedAdmin) renders the date/range label in a
    // span.k-button-text - check that first before scanning generally.
    const candidates = [
      ...document.querySelectorAll(".k-button-text"),
      ...document.querySelectorAll("button span"),
    ];

    for (const el of candidates) {
      if (el.classList.contains(BADGE_CLASS)) continue;
      if (el.children.length > 0) continue; // want a leaf text element
      if (looksLikeDate(el.textContent)) return el;
    }
    return null;
  }

  function getTargetElement() {
    return getTargetElementByXPath() || findTargetByContent();
  }

  function ensureStyles() {
    if (document.getElementById("sa-week-number-style")) return;
    const style = document.createElement("style");
    style.id = "sa-week-number-style";
    style.textContent = `
      .${BADGE_CLASS} {
        margin-left: 6px;
        padding: 1px 6px;
        font-size: 11px;
        font-weight: 600;
        color: #fff;
        background: #2f80ed;
        border-radius: 10px;
        white-space: nowrap;
        vertical-align: middle;
      }
    `;
    document.head.appendChild(style);
  }

  function injectWeekNumber() {
    if (!enabled) return;

    const target = getTargetElement();
    if (!target) return;

    const date = parseDate(target.textContent);
    if (!date || isNaN(date.getTime())) return;

    const week = getWeekNumber(date);
    const label = `Uge ${week}`;

    let badge = target.parentElement && target.parentElement.querySelector(`.${BADGE_CLASS}`);
    if (badge && badge.textContent === label) return;

    applying = true;
    if (!badge) {
      badge = document.createElement("span");
      badge.className = BADGE_CLASS;
      target.insertAdjacentElement("afterend", badge);
    }
    badge.textContent = label;
    applying = false;
  }

  function removeWeekNumbers() {
    document.querySelectorAll(`.${BADGE_CLASS}`).forEach((badge) => badge.remove());
  }

  function setEnabled(value) {
    enabled = value;

    if (enabled) {
      ensureStyles();
      injectWeekNumber();
      if (!observer) {
        observer = new MutationObserver(() => scheduleUpdate());
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    } else {
      observer?.disconnect();
      observer = null;
      removeWeekNumbers();
    }
  }

  function scheduleUpdate() {
    if (applying || scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      injectWeekNumber();
    });
  }

  function init() {
    chrome.storage.local.get(["enabled"], (result) => {
      setEnabled(result.enabled !== false);
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "setEnabled") {
        setEnabled(message.enabled);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
