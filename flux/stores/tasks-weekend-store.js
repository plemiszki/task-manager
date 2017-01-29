var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var TasksWeekendStore = new Store(AppDispatcher);

var _tasks = {};

TasksWeekendStore.setTasks = function(tasks) {
  _tasks = {};
  tasks.forEach(function(task) {
    _tasks[task.id] = task;
  });
};

TasksWeekendStore.find = function(id) {
  return _tasks[id];
};

TasksWeekendStore.all = function() {
  return Object.keys(_tasks).map(function(id) {
    return(_tasks[id]);
  });
};

TasksWeekendStore.rootTasks = function() {
  var hash = {};
  TasksWeekendStore.all().forEach(function(task) {
    if (!task.parent_id) {
      hash[task.order] = task;
    }
  });
  var result = [];
  Object.keys(hash).sort().forEach(function(index) {
    result.push(hash[index]);
  })
  return result;
};

TasksWeekendStore.subTasks = function(id) {
  var hash = {};
  TasksWeekendStore.all().forEach(function(task) {
    if (task.parent_id == id) {
      hash[task.order] = task;
    }
  });
  var result = [];
  Object.keys(hash).sort().forEach(function(index) {
    result.push(hash[index]);
  })
  return result;
};

TasksWeekendStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "WEEKEND_TASKS_RECEIVED":
      this.setTasks(payload.tasks);
      this.__emitChange();
      break;
  }
};

module.exports = TasksWeekendStore;
