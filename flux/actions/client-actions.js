var AppDispatcher = require('../dispatcher/dispatcher.js');
var ServerActions = require('../actions/server-actions.js');

var ClientActions = {

  fetchTasks: function(timeframe) {
    $.ajax({
      url: '/api/tasks',
      type: "GET",
      success: function(response) {
        ServerActions.receiveTasks(response);
      }
    });
  },

  addTask: function(timeframe, parent_id, task) {
    if (task) {
      task = {
        text: task.text,
        color: task.color,
        duplicate_id: task.id,
        complete: task.complete,
        timeframe: timeframe
      };
    }
    $.ajax({
      url: '/api/tasks',
      type: "POST",
      data: {
        timeframe: timeframe,
        parent_id: parent_id,
        task: task
      },
      success: function(response) {
        ServerActions.receiveTasks(response);
      }
    });
  },

  updateTask: function(task) {
    $.ajax({
      url: '/api/tasks',
      type: "PATCH",
      data: {
        task: task
      },
      success: function(response) {
        ServerActions.receiveTasks(response);
      }
    });
  },

  deleteTask: function(task) {
    $.ajax({
      url: '/api/tasks',
      type: 'DELETE',
      data: {
        id: task.id,
        timeframe: task.timeframe
      },
      success: function(response) {
        ServerActions.receiveTasks(response);
      }
    });
  },

  rearrangeTasks: function(hash, timeframe) {
    $.ajax({
      url: '/api/tasks/rearrange',
      type: "PATCH",
      data: {
        tasks: hash,
        timeframe: timeframe
      },
      success: function(response) {
        ServerActions.receiveTasks(response);
      }
    });
  }
};

module.exports = ClientActions;
