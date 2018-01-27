var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');
var HandyTools = require('handy-tools');

var RecurringTasksStore = new Store(AppDispatcher);

var _dailyTasks = {};
var _weekendTasks = {};
var _monthlyTasks = {};

RecurringTasksStore.setStuff = function(payload) {
  _dailyTasks = {};
  payload.dailyTasks.forEach(function(task) {
    _dailyTasks[task.id] = task;
  });
  _weekendTasks = {};
  payload.weekendTasks.forEach(function(task) {
    _weekendTasks[task.id] = task;
  });
  _monthlyTasks = {};
  payload.monthlyTasks.forEach(function(task) {
    _monthlyTasks[task.id] = task;
  });
};

RecurringTasksStore.dailyTasks = function() {
  var tasks = [];
  Object.keys(_dailyTasks).forEach(function(id) {
    tasks.push(_dailyTasks[id]);
  });
  return HandyTools.sortArrayOfDateStrings(tasks, 'date');
};

RecurringTasksStore.weekendTasks = function() {
  var tasks = [];
  Object.keys(_weekendTasks).forEach(function(id) {
    tasks.push(_weekendTasks[id]);
  });
  return HandyTools.sortArrayOfDateStrings(tasks, 'date');
};

RecurringTasksStore.monthlyTasks = function() {
  var tasks = [];
  Object.keys(_monthlyTasks).forEach(function(id) {
    tasks.push(_monthlyTasks[id]);
  });
  return HandyTools.sortArrayOfDateStrings(tasks, 'date');
};

RecurringTasksStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "RECURRING_TASKS_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = RecurringTasksStore;
