/**
 * check.js
 * Contains the shift fit logic for ShiftFit.
 * Compares a proposed shift against classes, assessments,
 * study blocks, and existing work shifts.
 */

/**
 * Convert a "HH:MM" time string to minutes from midnight.
 * Example: "09:30" → 570
 */
function timeToMinutes(timeStr) {
  var parts = timeStr.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/**
 * Get the day of the week from an ISO date string (e.g. "2026-10-02").
 * Returns "Monday", "Tuesday", etc.
 */
function getDayOfWeek(dateStr) {
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var date = new Date(dateStr + "T00:00:00");
  return days[date.getDay()];
}

/**
 * Check if two time ranges overlap on the same day.
 * Both ranges are given as minutes from midnight.
 */
function timesOverlap(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}

/**
 * Check a proposed shift against the user's session data.
 *
 * Returns an object:
 * {
 *   verdict: "Good Fit" | "Tight Fit" | "Conflict",
 *   summary: "short summary string",
 *   explanations: ["bullet 1", "bullet 2", ...]
 * }
 */
function checkShift(proposed, data) {
  var explanations = [];
  var hasConflict = false;
  var hasTightFit = false;

  var proposedDay = getDayOfWeek(proposed.date);
  var proposedStart = timeToMinutes(proposed.startTime);
  var proposedEnd = timeToMinutes(proposed.endTime);

  // --- CHECK 1: Class conflicts ---
  var classConflict = false;
  data.classes.forEach(function(cls) {
    if (cls.day === proposedDay) {
      var clsStart = timeToMinutes(cls.startTime);
      var clsEnd = timeToMinutes(cls.endTime);
      if (timesOverlap(proposedStart, proposedEnd, clsStart, clsEnd)) {
        classConflict = true;
        hasConflict = true;
        explanations.push("Your class '" + cls.name + "' overlaps this shift (" + cls.day + " " + cls.startTime + "–" + cls.endTime + ")");
      }
    }
  });
  if (!classConflict) {
    explanations.push("No scheduled class overlaps this shift");
  }

  // --- CHECK 2: Existing work shift conflicts ---
  var workConflict = false;
  data.workShifts.forEach(function(shift) {
    if (shift.date === proposed.date) {
      var wStart = timeToMinutes(shift.startTime);
      var wEnd = timeToMinutes(shift.endTime);
      if (timesOverlap(proposedStart, proposedEnd, wStart, wEnd)) {
        workConflict = true;
        hasConflict = true;
        explanations.push("Your existing shift at '" + shift.employer + "' overlaps this shift (" + shift.startTime + "–" + shift.endTime + ")");
      }
    }
  });
  if (!workConflict) {
    explanations.push("No existing work shift overlaps this shift");
  }

  // --- CHECK 3: Assessment deadline on the same day ---
  var sameDayAssessment = false;
  data.assessments.forEach(function(assessment) {
    if (assessment.dueDate === proposed.date) {
      sameDayAssessment = true;
      hasTightFit = true;
      explanations.push(assessment.name + " is due on " + proposedDay);
    }
  });
  if (sameDayAssessment) {
    explanations.push("Weekly work hours will increase; an assessment is due the same day");
  }

  // --- CHECK 4: Study block affected ---
  var studyAffected = false;
  data.studyBlocks.forEach(function(block) {
    if (block.day === proposedDay) {
      var bStart = timeToMinutes(block.startTime);
      var bEnd = timeToMinutes(block.endTime);
      if (timesOverlap(proposedStart, proposedEnd, bStart, bEnd)) {
        studyAffected = true;
        hasTightFit = true;
        explanations.push("Your planned study time on " + proposedDay + " would be reduced");
      }
    }
  });

  // --- DETERMINE VERDICT ---
  var verdict = "Good Fit";
  if (hasConflict) {
    verdict = "Conflict";
  } else if (hasTightFit) {
    verdict = "Tight Fit";
  }

  // Build summary
  var summary = "";
  if (verdict === "Conflict") {
    summary = "This shift has direct time conflicts with your commitments.";
  } else if (verdict === "Tight Fit") {
    summary = "This shift may affect your study or assessment deadlines.";
  } else {
    summary = "This shift does not overlap any of your scheduled commitments.";
  }

  return {
    verdict: verdict,
    summary: summary,
    explanations: explanations
  };
}
