// search.js - regex search and highlight

function compileRegex(input, ignoreCase) {
  if (input === "") {
    return null;
  }
  var flags = "g";
  if (ignoreCase) {
    flags = "gi";
  }
  try {
    return new RegExp(input, flags);
  } catch (e) {
    return null;
  }
}

// making text safe so it can't inject HTML
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlight(text, re) {
  if (re == null) {
    return escapeHtml(text);
  }
  var result = "";
  var last = 0;
  var match = re.exec(text);
  while (match != null) {
    if (match[0] === "") {
      re.lastIndex++;   // preventing infinite loop on empty matches
    } else {
      result += escapeHtml(text.slice(last, match.index));
      result += "<mark>" + escapeHtml(match[0]) + "</mark>";
      last = match.index + match[0].length;
    }
    match = re.exec(text);
  }
  result += escapeHtml(text.slice(last));
  re.lastIndex = 0;
  return result;
}

