var AppDispatcher = require('../dispatcher/dispatcher.js');
var ServerActions = require('../actions/server-actions.js');

var ClientActions = {

  fetchTasks: function(timeframe) {
    $.ajax({
      url: '/api/tasks',
      type: "GET",
      data: {
        timeframe: timeframe
      },
      success: function(response) {
        switch (timeframe) {
          case "day":
            ServerActions.receiveDayTasks(response);
            break;
          case "weekend":
            ServerActions.receiveWeekendTasks(response);
            break;
          case "month":
            ServerActions.receiveMonthTasks(response);
            break;
          case "year":
            ServerActions.receiveYearTasks(response);
            break;
          case "life":
            ServerActions.receiveLifeTasks(response);
            break;
        }
      }
    });
  },

  addTask: function(timeframe, parent_id) {
    $.ajax({
      url: '/api/tasks',
      type: "POST",
      data: {
        timeframe: timeframe,
        parent_id: parent_id
      },
      success: function(response) {
        switch (timeframe) {
          case "day":
            ServerActions.receiveDayTasks(response);
            break;
          case "weekend":
            ServerActions.receiveWeekendTasks(response);
            break;
          case "month":
            ServerActions.receiveMonthTasks(response);
            break;
          case "year":
            ServerActions.receiveYearTasks(response);
            break;
          case "life":
            ServerActions.receiveLifeTasks(response);
            break;
        }
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
        switch (task.timeframe) {
          case "day":
            ServerActions.receiveDayTasks(response);
            break;
          case "weekend":
            ServerActions.receiveWeekendTasks(response);
            break;
          case "month":
            ServerActions.receiveMonthTasks(response);
            break;
          case "year":
            ServerActions.receiveYearTasks(response);
            break;
          case "life":
            ServerActions.receiveLifeTasks(response);
            break;
        }
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
        switch (task.timeframe) {
          case "day":
            ServerActions.receiveDayTasks(response);
            break;
          case "weekend":
            ServerActions.receiveWeekendTasks(response);
            break;
          case "month":
            ServerActions.receiveMonthTasks(response);
            break;
          case "year":
            ServerActions.receiveYearTasks(response);
            break;
          case "life":
            ServerActions.receiveLifeTasks(response);
            break;
        }
      }
    });
  }
};

module.exports = ClientActions;
