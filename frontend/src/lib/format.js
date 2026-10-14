/**
 * format.js
 * Date and time formatting helpers.
 * Verbatim port from ShiftFit Assessment 2 (js/app.js lines 31-48).
 */

export function formatTime(timeStr) {
  var parts = timeStr.split(":");
  var h = parseInt(parts[0], 10);
  var m = parts[1];
  var ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h = h - 12;
  if (h === 0) h = 12;
  return h + ":" + m + " " + ampm;
}

export function formatDate(dateStr) {
  var options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  var date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-AU", options);
}