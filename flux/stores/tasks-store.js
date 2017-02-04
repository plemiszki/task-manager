var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var TasksStore = new Store(AppDispatcher);

var _tasks = {};

TasksStore.setTasks = function(tasks) {
  _tasks = {};
  tasks.forEach(function(task) {
    _tasks[task.id] = task;
  });
};

TasksStore.find = function(id) {
  return _tasks[id];
};

TasksStore.all = function(timeframe) {
  var result = [];
  Object.keys(_tasks).forEach(function(id) {
    if (_tasks[id].timeframe === timeframe) {
      result.push(_tasks[id]);
    }
  });
  return result;
};

TasksStore.rootTasks = function(timeframe) {
  var hash = {};
  TasksStore.all(timeframe).forEach(function(task) {
    if (!task.parent_id) {
      hash[task.order] = task;
    }
  });
  var result = [];
  var sortedKeys = Object.keys(hash).sort(function(a, b) {
    return +a - +b;
  });
  sortedKeys.forEach(function(index) {
    result.push(hash[index]);
  })
  return result;
};

TasksStore.subTasks = function(parentTask) {
  var hash = {};
  TasksStore.all(parentTask.timeframe).forEach(function(task) {
    if (task.parent_id == parentTask.id) {
      hash[task.order] = task;
    }
  });
  var result = [];
  var sortedKeys = Object.keys(hash).sort(function(a, b) {
    return +a - +b;
  });
  sortedKeys.forEach(function(index) {
    result.push(hash[index]);
  })
  return result;
};

TasksStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "TASKS_RECEIVED":
      this.setTasks(payload.tasks);
      this.__emitChange();
      break;
  }
};

module.exports = TasksStore;
