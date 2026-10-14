// app.js - state + UI

var records = loadRecords();
var settings = loadSettings();
var editingId = null;

// ---------- helpers ----------
function $(id) {
  return document.getElementById(id);
}

function makeId() {
  return "rec_" + Date.now();
}

function formatDuration(minutes) {
  if (settings.unit === "hours") {
    return (minutes / 60).toFixed(1) + " hrs";
  }
  return minutes + " min";
}

// ---------- pages ----------
function showPage(name) {
  var sections = document.querySelectorAll("section");
  for (var i = 0; i < sections.length; i++) {
    sections[i].classList.remove("show");
  }
  $(name).classList.add("show");

  var buttons = document.querySelectorAll("nav button");
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].classList.remove("active");
    buttons[j].removeAttribute("aria-current");
    if (buttons[j].getAttribute("data-page") === name) {
      buttons[j].classList.add("active");
      buttons[j].setAttribute("aria-current", "page");
    }
  }
  if (name === "records") showRecords();
  if (name === "dashboard") showStats();
}

var navButtons = document.querySelectorAll("nav button");
for (var n = 0; n < navButtons.length; n++) {
  navButtons[n].addEventListener("click", function () {
    showPage(this.getAttribute("data-page"));
  });
}

// ---------- records list ----------
function sortRecords(list) {
  var how = $("sortBox").value;
  list.sort(function (a, b) {
    if (how === "date-asc") return a.dueDate.localeCompare(b.dueDate);
    if (how === "date-desc") return b.dueDate.localeCompare(a.dueDate);
    if (how === "title-asc") return a.title.localeCompare(b.title);
    if (how === "title-desc") return b.title.localeCompare(a.title);
    if (how === "dur-asc") return a.duration - b.duration;
    return b.duration - a.duration;
  });
  return list;
}

function showRecords() {
  var text = $("searchBox").value;
  var re = compileRegex(text, $("caseBox").checked);

  if (text !== "" && re == null) {
    $("searchMsg").textContent = "That regex is not valid yet.";
  } else {
    $("searchMsg").textContent = "";
  }

  var list = records.slice();
  if (re != null) {
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
      var all = list[i].title + " " + list[i].tag;
      re.lastIndex = 0;
      if (re.test(all)) {
        filtered.push(list[i]);
      }
    }
    list = filtered;
  }
  list = sortRecords(list);

  var html = "";
  for (var k = 0; k < list.length; k++) {
    var r = list[k];
    html += '<article class="card">';
    html += "<h3>" + highlight(r.title, re) + "</h3>";
    html += "<p>Due: " + r.dueDate + "<br>Duration: " + formatDuration(r.duration) + "</p>";
    html += '<span class="tag">' + highlight(r.tag, re) + "</span><br>";
    html += '<button data-edit="' + r.id + '" aria-expanded="false">Edit inline</button>';
    html += '<button class="red" data-delete="' + r.id + '">Delete</button>';
    html += '<form class="inline-edit" data-inline-form="' + r.id + '" hidden>';
    html += '<label>Title <input type="text" data-field="title" value="' + escapeHtml(r.title) + '" required></label>';
    html += '<label>Due date <input type="text" data-field="dueDate" value="' + escapeHtml(r.dueDate) + '" required></label>';
    html += '<label>Duration (minutes) <input type="text" data-field="duration" value="' + r.duration + '" required></label>';
    html += '<label>Tag <input type="text" data-field="tag" value="' + escapeHtml(r.tag) + '" required></label>';
    html += '<p class="error" data-inline-error role="status"></p>';
    html += '<button type="submit">Save inline changes</button>';
    html += '<button type="button" class="grey" data-inline-cancel="' + r.id + '">Cancel</button>';
    html += '</form></article>';
  }
  if (list.length === 0) {
    html = "<p>No tasks found. Add one from the Add / Edit page!</p>";
  }
  $("list").innerHTML = html;

  if (re != null) {
    $("searchMsg").textContent = list.length + " task(s) match.";
  }
}

$("searchBox").addEventListener("input", showRecords);
$("sortBox").addEventListener("change", showRecords);
$("caseBox").addEventListener("change", showRecords);

// edit and delete buttons (one listener for the whole list)
$("list").addEventListener("click", function (e) {
  var editId = e.target.getAttribute("data-edit");
  var deleteId = e.target.getAttribute("data-delete");
  if (editId) {
    var form = document.querySelector('[data-inline-form="' + editId + '"]');
    if (form) {
      form.hidden = !form.hidden;
      e.target.setAttribute("aria-expanded", String(!form.hidden));
      if (!form.hidden) form.querySelector('[data-field="title"]').focus();
    }
  }
  var cancelId = e.target.getAttribute("data-inline-cancel");
  if (cancelId) showRecords();
  if (deleteId) deleteRecord(deleteId);
});

$("list").addEventListener("submit", function (e) {
  var form = e.target.closest("[data-inline-form]");
  if (!form) return;
  e.preventDefault();
  var id = form.getAttribute("data-inline-form");
  var title = form.querySelector('[data-field="title"]').value;
  var dueDate = form.querySelector('[data-field="dueDate"]').value;
  var duration = form.querySelector('[data-field="duration"]').value;
  var tag = form.querySelector('[data-field="tag"]').value;
  var message = checkTitle(title) || checkDate(dueDate) || checkDuration(duration) || checkTag(tag);
  if (message) { form.querySelector("[data-inline-error]").textContent = message; return; }
  var record = records.find(function (item) { return item.id === id; });
  if (!record) return;
  record.title = title;
  record.dueDate = dueDate;
  record.duration = Number(duration);
  record.tag = tag;
  record.updatedAt = new Date().toISOString();
  saveRecords(records);
  showRecords();
  showStats();
  $("searchMsg").textContent = "Task updated.";
});

function deleteRecord(id) {
  var sure = confirm("Delete this task?");
  if (!sure) return;
  var newList = [];
  for (var i = 0; i < records.length; i++) {
    if (records[i].id !== id) newList.push(records[i]);
  }
  records = newList;
  saveRecords(records);
  showRecords();
  $("searchMsg").textContent = "Task deleted.";
}

function startEdit(id) {
  for (var i = 0; i < records.length; i++) {
    if (records[i].id === id) {
      editingId = id;
      $("title").value = records[i].title;
      $("dueDate").value = records[i].dueDate;
      $("duration").value = records[i].duration;
      $("tag").value = records[i].tag;
      $("formTitle").textContent = "Edit Task";
    }
  }
  showPage("form");
  $("title").focus();
}

// ---------- form ----------
function clearForm() {
  editingId = null;
  $("taskForm").reset();
  $("formTitle").textContent = "Add Task";
  $("titleErr").textContent = "";
  $("dateErr").textContent = "";
  $("durErr").textContent = "";
  $("tagErr").textContent = "";
}

// live feedback while typing
$("title").addEventListener("input", function () { $("titleErr").textContent = checkTitle($("title").value); });
$("dueDate").addEventListener("input", function () { $("dateErr").textContent = checkDate($("dueDate").value); });
$("duration").addEventListener("input", function () { $("durErr").textContent = checkDuration($("duration").value); });
$("tag").addEventListener("input", function () { $("tagErr").textContent = checkTag($("tag").value); });

$("cancelBtn").addEventListener("click", function () {
  clearForm();
  showPage("records");
});

$("taskForm").addEventListener("submit", function (e) {
  e.preventDefault();

  var title = $("title").value;
  var dueDate = $("dueDate").value;
  var duration = $("duration").value;
  var tag = $("tag").value;

  var e1 = checkTitle(title);
  var e2 = checkDate(dueDate);
  var e3 = checkDuration(duration);
  var e4 = checkTag(tag);
  $("titleErr").textContent = e1;
  $("dateErr").textContent = e2;
  $("durErr").textContent = e3;
  $("tagErr").textContent = e4;

  if (e1 !== "" || e2 !== "" || e3 !== "" || e4 !== "") {
    $("formMsg").textContent = "Please fix the errors above.";
    return;
  }

  var now = new Date().toISOString();
  if (editingId == null) {
    records.push({
      id: makeId(),
      title: title,
      dueDate: dueDate,
      duration: Number(duration),
      tag: tag,
      createdAt: now,
      updatedAt: now
    });
    $("formMsg").textContent = "Task added!";
  } else {
    for (var i = 0; i < records.length; i++) {
      if (records[i].id === editingId) {
        records[i].title = title;
        records[i].dueDate = dueDate;
        records[i].duration = Number(duration);
        records[i].tag = tag;
        records[i].updatedAt = now;
      }
    }
    $("formMsg").textContent = "Task updated!";
  }
  saveRecords(records);
  clearForm();
  showPage("records");
});

// ---------- dashboard ----------
function showStats() {
  var total = 0;
  var minutes = 0;
  var tagCount = {};
  for (var i = 0; i < records.length; i++) {
    total++;
    minutes += records[i].duration;
    var t = records[i].tag;
    if (tagCount[t] == null) tagCount[t] = 0;
    tagCount[t]++;
  }

  var topTag = "-";
  var best = 0;
  for (var name in tagCount) {
    if (tagCount[name] > best) {
      best = tagCount[name];
      topTag = name;
    }
  }

  $("statTotal").textContent = total;
  $("statTime").textContent = formatDuration(minutes);
  $("statTag").textContent = topTag;

  // cap message
  var cap = Number(settings.cap);
  if (minutes > cap) {
    $("capPolite").textContent = "";
    $("capAlert").textContent = "Over the cap by " + formatDuration(minutes - cap) + "!";
  } else {
    $("capAlert").textContent = "";
    $("capPolite").textContent = formatDuration(cap - minutes) + " left before your cap.";
  }

  drawChart();
}

function drawChart() {
  var html = "";
  for (var d = 6; d >= 0; d--) {
    var day = new Date();
    day.setDate(day.getDate() - d);
    var dayText = day.toISOString().slice(0, 10);
    var count = 0;
    for (var i = 0; i < records.length; i++) {
      if (records[i].dueDate === dayText) count++;
    }
    html += '<div class="bar-wrap">' + count;
    html += '<div class="bar" style="height:' + (count * 25 + 4) + 'px"></div>';
    html += dayText.slice(5) + "</div>";
  }
  $("chart").innerHTML = html;
}

// ---------- settings ----------
$("unitBox").value = settings.unit;
$("capBox").value = settings.cap;

$("saveSettings").addEventListener("click", function () {
  if (!numberRule.test($("capBox").value) || !Number.isFinite(Number($("capBox").value))) {
    $("settingsMsg").textContent = "Cap must be a number.";
    return;
  }
  settings.unit = $("unitBox").value;
  settings.cap = Number($("capBox").value);
  saveSettings(settings);
  showStats();
  showRecords();
  $("settingsMsg").textContent = "Settings saved.";
});

$("exportBtn").addEventListener("click", function () {
  var text = JSON.stringify(records, null, 2);
  var blob = new Blob([text], { type: "application/json" });
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "planner-data.json";
  link.click();
  $("settingsMsg").textContent = "Exported!";
});

function loadImported(data) {
  if (!Array.isArray(data)) {
    $("settingsMsg").textContent = "Import failed: file must be a list.";
    return;
  }
  if (!checkRecords(data)) {
    $("settingsMsg").textContent = "Import failed: a record is invalid or IDs are duplicated.";
    return;
  }
  records = data;
  saveRecords(records);
  $("settingsMsg").textContent = "Imported " + data.length + " tasks.";
}

$("importBox").addEventListener("change", function () {
  var file = $("importBox").files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function () {
    try {
      loadImported(JSON.parse(reader.result));
    } catch (err) {
      $("settingsMsg").textContent = "Import failed: not valid JSON.";
    }
  };
  reader.readAsText(file);
});

$("seedBtn").addEventListener("click", function () {
  fetch("./seed.json")
    .then(function (res) {
      if (!res.ok) {
        throw new Error("Could not find seed.json");
      }
      return res.json();
    })
    .then(function (data) {
      loadImported(data);
    })
    .catch(function (error) {
      console.error(error);
      $("settingsMsg").textContent =
        "Could not load seed.json. Check the file path and try again.";
    });
});

// start on the About page
showPage("about");

