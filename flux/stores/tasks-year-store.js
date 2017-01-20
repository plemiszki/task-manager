var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var TasksYearStore = new Store(AppDispatcher);

var _tasks = {};

TasksYearStore.setTasks = function(tasks) {
  _tasks = {};
  tasks.forEach(function(task) {
    _tasks[task.id] = task;
  });
};

TasksYearStore.find = function(id) {
  return _tasks[id];
};

TasksYearStore.all = function() {
  return Object.keys(_tasks).map(function(id) {
    return(_tasks[id]);
  });
};

TasksYearStore.subTasks = function(id) {
  var result = [];
  TasksYearStore.all().forEach(function(task) {
    if (task.parent_id == id) {
      result.push(task);
    }
  });
  return result;
};

TasksYearStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "YEAR_TASKS_RECEIVED":
      this.setTasks(payload.tasks);
      this.__emitChange();
      break;
  }
};

module.exports = TasksYearStore;
