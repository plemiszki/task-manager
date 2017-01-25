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

TasksWeekendStore.subTasks = function(id) {
  var result = [];
  TasksWeekendStore.all().forEach(function(task) {
    if (task.parent_id == id) {
      result.push(task);
    }
  });
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
