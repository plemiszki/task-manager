var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var TasksMonthStore = new Store(AppDispatcher);

var _tasks = {};

TasksMonthStore.setTasks = function(tasks) {
  _tasks = {};
  tasks.forEach(function(task) {
    _tasks[task.id] = task;
  });
};

TasksMonthStore.find = function(id) {
  return _tasks[id];
};

TasksMonthStore.all = function() {
  return Object.keys(_tasks).map(function(id) {
    return(_tasks[id]);
  });
};

TasksMonthStore.subTasks = function(id) {
  var result = [];
  TasksMonthStore.all().forEach(function(task) {
    if (task.parent_id == id) {
      result.push(task);
    }
  });
  return result;
};

TasksMonthStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "MONTH_TASKS_RECEIVED":
      this.setTasks(payload.tasks);
      this.__emitChange();
      break;
  }
};

module.exports = TasksMonthStore;
