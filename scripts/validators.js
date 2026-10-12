// validators.js - field and imported-data checks
var titleRule = /^\S(?:.*\S)?$/;
var numberRule = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
var dateRule = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
var tagRule = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
var duplicateWordRule = /\b(\w+)\s+\1\b/i;

function checkTitle(value) {
  if (!titleRule.test(value)) return "Title is required and cannot start or end with a space.";
  if (duplicateWordRule.test(value)) return "Title has a repeated word (like 'the the'). Please fix it.";
  return "";
}
function checkDuration(value) {
  if (!numberRule.test(value) || !Number.isFinite(Number(value)) || Number(value) < 0) return "Enter a number like 60 or 1.5.";
  return "";
}
function checkDate(value) {
  if (!dateRule.test(value)) return "Use the format YYYY-MM-DD.";
  var parts = value.split("-").map(Number);
  var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  if (date.getUTCFullYear() !== parts[0] || date.getUTCMonth() !== parts[1] - 1 || date.getUTCDate() !== parts[2]) return "Enter a real calendar date.";
  return "";
}
function checkTag(value) {
  return tagRule.test(value) ? "" : "Tag can only have letters, spaces and hyphens.";
}
function checkRecord(r) {
  if (typeof r !== "object" || r === null || Array.isArray(r)) return false;
  if (typeof r.id !== "string" || !/^rec_[A-Za-z0-9_-]{1,80}$/.test(r.id)) return false;
  if (typeof r.title !== "string" || checkTitle(r.title) !== "") return false;
  if (typeof r.duration !== "number" || !Number.isFinite(r.duration) || r.duration < 0) return false;
  if (typeof r.tag !== "string" || checkTag(r.tag) !== "") return false;
  if (typeof r.dueDate !== "string" || checkDate(r.dueDate) !== "") return false;
  if (typeof r.createdAt !== "string" || typeof r.updatedAt !== "string") return false;
  if (Number.isNaN(Date.parse(r.createdAt)) || Number.isNaN(Date.parse(r.updatedAt))) return false;
  return true;
}
function checkRecords(data) {
  if (!Array.isArray(data)) return false;
  var ids = new Set();
  for (var i = 0; i < data.length; i++) {
    if (!checkRecord(data[i]) || ids.has(data[i].id)) return false;
    ids.add(data[i].id);
  }
  return true;
}

