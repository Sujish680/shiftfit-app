/**
 * data.js
 * Manages the ShiftFit session data model.
 * Stores all data in sessionStorage so it persists across page refresh.
 */

// The default empty data structure
var defaultData = {
  classes: [],
  assessments: [],
  studyBlocks: [],
  workShifts: []
};

/**
 * Load data from sessionStorage.
 * Returns the default structure if nothing is stored yet.
 */
function loadData() {
  var stored = sessionStorage.getItem("shiftfit");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return JSON.parse(JSON.stringify(defaultData));
    }
  }
  return JSON.parse(JSON.stringify(defaultData));
}

/**
 * Save the data object back to sessionStorage.
 */
function saveData(data) {
  sessionStorage.setItem("shiftfit", JSON.stringify(data));
}

/**
 * Generate a simple unique ID using the current timestamp.
 */
function generateId() {
  return Date.now();
}

/**
 * Add a class to the data and save.
 * Returns the new class object.
 */
function addClass(name, day, startTime, endTime) {
  var data = loadData();
  var newClass = {
    id: generateId(),
    name: name,
    day: day,
    startTime: startTime,
    endTime: endTime
  };
  data.classes.push(newClass);
  saveData(data);
  return newClass;
}

/**
 * Add an assessment to the data and save.
 * Returns the new assessment object.
 */
function addAssessment(name, dueDate) {
  var data = loadData();
  var newAssessment = {
    id: generateId(),
    name: name,
    dueDate: dueDate
  };
  data.assessments.push(newAssessment);
  saveData(data);
  return newAssessment;
}

/**
 * Add a study block to the data and save.
 * Returns the new study block object.
 */
function addStudyBlock(day, startTime, endTime) {
  var data = loadData();
  var newBlock = {
    id: generateId(),
    day: day,
    startTime: startTime,
    endTime: endTime
  };
  data.studyBlocks.push(newBlock);
  saveData(data);
  return newBlock;
}

/**
 * Add a work shift to the data and save.
 * Returns the new work shift object.
 */
function addWorkShift(employer, date, startTime, endTime) {
  var data = loadData();
  var newShift = {
    id: generateId(),
    employer: employer,
    date: date,
    startTime: startTime,
    endTime: endTime
  };
  data.workShifts.push(newShift);
  saveData(data);
  return newShift;
}

/**
 * Remove an item by its id from a named collection (e.g. "classes").
 */
function removeItem(collection, id) {
  var data = loadData();
  data[collection] = data[collection].filter(function(item) {
    return item.id !== id;
  });
  saveData(data);
}
