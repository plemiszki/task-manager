var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var TasksDayStore = new Store(AppDispatcher);

var _tasks = {};

TasksDayStore.setTasks = function(tasks) {
  _tasks = {};
  tasks.forEach(function(task) {
    _tasks[task.id] = task;
  });
};

TasksDayStore.find = function(id) {
  return _tasks[id];
};

TasksDayStore.all = function() {
  return Object.keys(_tasks).map(function(id) {
    return(_tasks[id]);
  });
};

TasksDayStore.rootTasks = function() {
  var hash = {};
  TasksDayStore.all().forEach(function(task) {
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

TasksDayStore.subTasks = function(id) {
  var hash = {};
  TasksDayStore.all().forEach(function(task) {
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

TasksDayStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "DAY_TASKS_RECEIVED":
      this.setTasks(payload.tasks);
      this.__emitChange();
      break;
  }
};

module.exports = TasksDayStore;
