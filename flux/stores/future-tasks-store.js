var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');
var HandyTools = require('handy-tools');

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
  var tasks = [];
  Object.keys(_tasks).forEach(function(id) {
    tasks.push(_tasks[id]);
  });
  return HandyTools.sortArrayOfDateStrings(tasks, 'date');
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
