var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');
var HandyTools = require('handy-tools');

var RecurringTasksStore = new Store(AppDispatcher);

var _dailyTasks = {};
var _weekendTasks = {};
var _monthlyTasks = {};

var _recurringTasks = {};
var _users = {};

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

RecurringTasksStore.setRecurringTasks = function(payload) {
  _recurringTasks = {};
  payload.recurringTasks.forEach(function(task) {
    _recurringTasks[task.id] = task;
  });
  payload.users.forEach(function(user) {
    _users[user.id] = user;
  });
};

RecurringTasksStore.dailyTasks = function() {
  var tasks = [];
  Object.keys(_dailyTasks).forEach(function(id) {
    tasks.push(_dailyTasks[id]);
  });
  return HandyTools.sortArrayOfObjects(tasks, 'order');
};

RecurringTasksStore.weekendTasks = function() {
  var tasks = [];
  Object.keys(_weekendTasks).forEach(function(id) {
    tasks.push(_weekendTasks[id]);
  });
  return HandyTools.sortArrayOfObjects(tasks, 'order');
};

RecurringTasksStore.monthlyTasks = function() {
  var tasks = [];
  Object.keys(_monthlyTasks).forEach(function(id) {
    tasks.push(_monthlyTasks[id]);
  });
  return HandyTools.sortArrayOfObjects(tasks, 'order');
};

RecurringTasksStore.find = function(id) {
  return _recurringTasks[id];
};

RecurringTasksStore.users = function() {
  var users = [];
  Object.keys(_users).forEach(function(id) {
    users.push(_users[id]);
  });
  return HandyTools.sortArrayOfObjects(users, 'email');
};

RecurringTasksStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case 'RECURRING_TASKS_RECEIVED':
      this.setStuff(payload);
      this.__emitChange();
      break;
    case 'RECURRING_TASK_RECEIVED':
      this.setRecurringTasks(payload);
      this.__emitChange();
      break;
  }
};

module.exports = RecurringTasksStore;
