// storage.js - saving and loading validated data
function loadRecords() {
  var text = localStorage.getItem("planner:records");
  if (text == null) return [];
  try {
    var data = JSON.parse(text);
    return checkRecords(data) ? data : [];
  } catch (e) { return []; }
}
function saveRecords(records) {
  localStorage.setItem("planner:records", JSON.stringify(records));
}
function loadSettings() {
  var text = localStorage.getItem("planner:settings");
  if (text == null) return { unit: "minutes", cap: 600 };
  try {
    var value = JSON.parse(text);
    if (!value || (value.unit !== "minutes" && value.unit !== "hours") || !Number.isFinite(value.cap) || value.cap < 0) throw new Error("Invalid settings");
    return value;
  } catch (e) { return { unit: "minutes", cap: 600 }; }
}
function saveSettings(settings) {
  localStorage.setItem("planner:settings", JSON.stringify(settings));
}

