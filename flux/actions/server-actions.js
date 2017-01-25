var AppDispatcher = require('../dispatcher/dispatcher.js');

var ServerActions = {

  receiveDayTasks: function(response) {
    AppDispatcher.dispatch({
      actionType: "DAY_TASKS_RECEIVED",
      tasks: response
    });
  },

  receiveWeekendTasks: function(response) {
    AppDispatcher.dispatch({
      actionType: "WEEKEND_TASKS_RECEIVED",
      tasks: response
    });
  },

  receiveMonthTasks: function(response) {
    AppDispatcher.dispatch({
      actionType: "MONTH_TASKS_RECEIVED",
      tasks: response
    });
  },

  receiveYearTasks: function(response) {
    AppDispatcher.dispatch({
      actionType: "YEAR_TASKS_RECEIVED",
      tasks: response
    });
  },

  receiveLifeTasks: function(response) {
    AppDispatcher.dispatch({
      actionType: "LIFE_TASKS_RECEIVED",
      tasks: response
    });
  }
};

module.exports = ServerActions;
