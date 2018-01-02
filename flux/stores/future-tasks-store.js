var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FutureTasksStore = new Store(AppDispatcher);

var _tasks = {};

FutureTasksStore.setTasks = function(tasks) {
  _tasks = {};
  tasks.forEach(function(task) {
    _tasks[task.id] = task;
  });
};

FutureTasksStore.find = function(id) {
  return _tasks[id];
};

FutureTasksStore.all = function() {
  var result = [];
  Object.keys(_tasks).forEach(function(id) {
    result.push(_tasks[id]);
  });
  return result;
};

FutureTasksStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "FUTURE_TASKS_RECEIVED":
      this.setTasks(payload.tasks);
      this.__emitChange();
      break;
  }
};

module.exports = FutureTasksStore;
