var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var TasksLifeStore = new Store(AppDispatcher);

var _tasks = {};

TasksLifeStore.setTasks = function(tasks) {
  _tasks = {};
  tasks.forEach(function(task) {
    _tasks[task.id] = task;
  });
};

TasksLifeStore.find = function(id) {
  return _tasks[id];
};

TasksLifeStore.all = function() {
  return Object.keys(_tasks).map(function(id) {
    return(_tasks[id]);
  });
};

TasksLifeStore.subTasks = function(id) {
  var result = [];
  TasksLifeStore.all().forEach(function(task) {
    if (task.parent_id == id) {
      result.push(task);
    }
  });
  return result;
};

TasksLifeStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "LIFE_TASKS_RECEIVED":
      this.setTasks(payload.tasks);
      this.__emitChange();
      break;
  }
};

module.exports = TasksLifeStore;
