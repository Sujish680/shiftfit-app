/**
 * app.js
 * Main application logic for ShiftFit.
 * Handles screen navigation, form submissions, and rendering.
 */

// Store the last proposed shift so we can add it after seeing the result
var lastProposedShift = null;

// ==================== SCREEN NAVIGATION ====================

/**
 * Show a screen by its id, hide all others.
 */
function showScreen(screenId) {
  var screens = document.querySelectorAll(".screen");
  screens.forEach(function(screen) {
    screen.classList.remove("active");
  });
  var target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
  }
}

// ==================== RENDER HELPERS ====================

/**
 * Format a time string like "09:00" to "9:00 AM".
 */
function formatTime(timeStr) {
  var parts = timeStr.split(":");
  var h = parseInt(parts[0], 10);
  var m = parts[1];
  var ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h = h - 12;
  if (h === 0) h = 12;
  return h + ":" + m + " " + ampm;
}

/**
 * Format an ISO date string like "2026-10-02" to a readable format.
 */
function formatDate(dateStr) {
  var options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  var date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-AU", options);
}

/**
 * Render the item lists on the Study Setup screen.
 */
function renderStudyLists() {
  var data = loadData();

  var classList = document.getElementById("class-list");
  classList.innerHTML = "";
  data.classes.forEach(function(cls) {
    var li = document.createElement("li");
    li.innerHTML =
      "<span>" + cls.name + " — " + cls.day + " " + formatTime(cls.startTime) + "–" + formatTime(cls.endTime) + "</span>" +
      '<button onclick="deleteClass(' + cls.id + ')">Remove</button>';
    classList.appendChild(li);
  });

  var assessList = document.getElementById("assessment-list");
  assessList.innerHTML = "";
  data.assessments.forEach(function(a) {
    var li = document.createElement("li");
    li.innerHTML =
      "<span>" + a.name + " — due " + formatDate(a.dueDate) + "</span>" +
      '<button onclick="deleteAssessment(' + a.id + ')">Remove</button>';
    assessList.appendChild(li);
  });

  var studyList = document.getElementById("study-list");
  studyList.innerHTML = "";
  data.studyBlocks.forEach(function(block) {
    var li = document.createElement("li");
    li.innerHTML =
      "<span>" + block.day + " " + formatTime(block.startTime) + "–" + formatTime(block.endTime) + "</span>" +
      '<button onclick="deleteStudyBlock(' + block.id + ')">Remove</button>';
    studyList.appendChild(li);
  });
}

/**
 * Render the work shift list on the Work Setup screen.
 */
function renderWorkList() {
  var data = loadData();
  var workList = document.getElementById("work-list");
  workList.innerHTML = "";
  data.workShifts.forEach(function(shift) {
    var li = document.createElement("li");
    li.innerHTML =
      "<span>" + shift.employer + " — " + formatDate(shift.date) + " " + formatTime(shift.startTime) + "–" + formatTime(shift.endTime) + "</span>" +
      '<button onclick="deleteWorkShift(' + shift.id + ')">Remove</button>';
    workList.appendChild(li);
  });
}

/**
 * Render the summary cards on the Home screen.
 */
function renderHomeSummary() {
  var data = loadData();

  var homeClasses = document.getElementById("home-classes");
  homeClasses.innerHTML = "";
  if (data.classes.length === 0) {
    homeClasses.innerHTML = '<li class="empty">No classes added yet</li>';
  } else {
    data.classes.forEach(function(cls) {
      var li = document.createElement("li");
      li.textContent = cls.name + " — " + cls.day + " " + formatTime(cls.startTime) + "–" + formatTime(cls.endTime);
      homeClasses.appendChild(li);
    });
  }

  var homeAssess = document.getElementById("home-assessments");
  homeAssess.innerHTML = "";
  if (data.assessments.length === 0) {
    homeAssess.innerHTML = '<li class="empty">No assessments added yet</li>';
  } else {
    data.assessments.forEach(function(a) {
      var li = document.createElement("li");
      li.textContent = a.name + " — due " + formatDate(a.dueDate);
      homeAssess.appendChild(li);
    });
  }

  var homeWork = document.getElementById("home-work");
  homeWork.innerHTML = "";
  if (data.workShifts.length === 0) {
    homeWork.innerHTML = '<li class="empty">No work shifts added yet</li>';
  } else {
    data.workShifts.forEach(function(shift) {
      var li = document.createElement("li");
      li.textContent = shift.employer + " — " + formatDate(shift.date) + " " + formatTime(shift.startTime) + "–" + formatTime(shift.endTime);
      homeWork.appendChild(li);
    });
  }
}

/**
 * Render the confirmation screen's updated work list.
 */
function renderConfirmation() {
  var data = loadData();
  var confirmList = document.getElementById("confirm-work-list");
  confirmList.innerHTML = "";
  if (data.workShifts.length === 0) {
    confirmList.innerHTML = '<li class="empty">No work shifts</li>';
  } else {
    data.workShifts.forEach(function(shift) {
      var li = document.createElement("li");
      li.textContent = shift.employer + " — " + formatDate(shift.date) + " " + formatTime(shift.startTime) + "–" + formatTime(shift.endTime);
      confirmList.appendChild(li);
    });
  }
}

// ==================== DELETE HANDLERS ====================

function deleteClass(id) {
  removeItem("classes", id);
  renderStudyLists();
}

function deleteAssessment(id) {
  removeItem("assessments", id);
  renderStudyLists();
}

function deleteStudyBlock(id) {
  removeItem("studyBlocks", id);
  renderStudyLists();
}

function deleteWorkShift(id) {
  removeItem("workShifts", id);
  renderWorkList();
}

// ==================== FORM HANDLERS ====================

function handleAddClass(event) {
  event.preventDefault();
  var name = document.getElementById("class-name").value.trim();
  var day = document.getElementById("class-day").value;
  var start = document.getElementById("class-start").value;
  var end = document.getElementById("class-end").value;
  if (name && day && start && end) {
    addClass(name, day, start, end);
    renderStudyLists();
    document.getElementById("form-add-class").reset();
  }
}

function handleAddAssessment(event) {
  event.preventDefault();
  var name = document.getElementById("assessment-name").value.trim();
  var date = document.getElementById("assessment-date").value;
  if (name && date) {
    addAssessment(name, date);
    renderStudyLists();
    document.getElementById("form-add-assessment").reset();
  }
}

function handleAddStudy(event) {
  event.preventDefault();
  var day = document.getElementById("study-day").value;
  var start = document.getElementById("study-start").value;
  var end = document.getElementById("study-end").value;
  if (day && start && end) {
    addStudyBlock(day, start, end);
    renderStudyLists();
    document.getElementById("form-add-study").reset();
  }
}

function handleAddWork(event) {
  event.preventDefault();
  var employer = document.getElementById("work-employer").value.trim();
  var date = document.getElementById("work-date").value;
  var start = document.getElementById("work-start").value;
  var end = document.getElementById("work-end").value;
  if (employer && date && start && end) {
    addWorkShift(employer, date, start, end);
    renderWorkList();
    document.getElementById("form-add-work").reset();
  }
}

// ==================== CHECK SHIFT & RESULT ====================

function handleCheckShift(event) {
  event.preventDefault();
  var employer = document.getElementById("check-employer").value.trim();
  var date = document.getElementById("check-date").value;
  var start = document.getElementById("check-start").value;
  var end = document.getElementById("check-end").value;

  if (employer && date && start && end) {
    lastProposedShift = {
      employer: employer,
      date: date,
      startTime: start,
      endTime: end
    };

    var data = loadData();
    var result = checkShift(lastProposedShift, data);

    var verdictMap = {
      "Good Fit":   { variant: "success" },
      "Tight Fit":  { variant: "warning" },
      "Conflict":   { variant: "destructive" }
    };
    var info = verdictMap[result.verdict] || verdictMap["Good Fit"];
    var badge = document.getElementById("result-badge");
    badge.setAttribute("variant", info.variant);
    badge.setAttribute("title", result.verdict);
    badge.setAttribute("description", result.summary);

    document.getElementById("result-summary").textContent = result.summary;

    var explanationsList = document.getElementById("result-explanations");
    explanationsList.innerHTML = "";
    result.explanations.forEach(function(bullet) {
      var li = document.createElement("li");
      li.textContent = bullet;
      explanationsList.appendChild(li);
    });

    showScreen("screen-result");
  }
}

function handleAddAnyway() {
  if (lastProposedShift) {
    addWorkShift(
      lastProposedShift.employer,
      lastProposedShift.date,
      lastProposedShift.startTime,
      lastProposedShift.endTime
    );
    document.getElementById("confirm-message").textContent =
      "Your shift at " + lastProposedShift.employer + " on " + formatDate(lastProposedShift.date) +
      " (" + formatTime(lastProposedShift.startTime) + "–" + formatTime(lastProposedShift.endTime) + ") has been added.";
    renderConfirmation();
    lastProposedShift = null;
    showScreen("screen-confirmation");
  }
}

// ==================== INITIALISE ====================

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("btn-get-started").addEventListener("click", function() {
    renderStudyLists();
    showScreen("screen-study-setup");
  });

  document.getElementById("form-add-class").addEventListener("submit", handleAddClass);
  document.getElementById("form-add-assessment").addEventListener("submit", handleAddAssessment);
  document.getElementById("form-add-study").addEventListener("submit", handleAddStudy);

  document.getElementById("btn-study-next").addEventListener("click", function() {
    renderWorkList();
    showScreen("screen-work-setup");
  });

  document.getElementById("form-add-work").addEventListener("submit", handleAddWork);

  document.getElementById("btn-work-next").addEventListener("click", function() {
    renderHomeSummary();
    showScreen("screen-home");
  });

  document.getElementById("btn-check-shift").addEventListener("click", function() {
    document.getElementById("form-check-shift").reset();
    showScreen("screen-check-shift");
  });

  document.getElementById("form-check-shift").addEventListener("submit", handleCheckShift);

  document.getElementById("btn-check-back").addEventListener("click", function() {
    renderHomeSummary();
    showScreen("screen-home");
  });

  document.getElementById("btn-add-anyway").addEventListener("click", handleAddAnyway);

  document.getElementById("btn-go-back").addEventListener("click", function() {
    showScreen("screen-check-shift");
  });

  document.getElementById("btn-back-home").addEventListener("click", function() {
    renderHomeSummary();
    showScreen("screen-home");
  });
});