var AppDispatcher = require('../dispatcher/dispatcher.js');

var ServerActions = {

  receiveUser: function(response) {
    AppDispatcher.dispatch({
      actionType: "USER_RECEIVED",
      user: response
    });
  },

  receiveTasks: function(response) {
    AppDispatcher.dispatch({
      actionType: "TASKS_RECEIVED",
      tasks: response
    });
  },

  receiveError: function() {
    AppDispatcher.dispatch({
      actionType: "ERROR"
    });
  },

  receiveCongress: function(response) {
    AppDispatcher.dispatch({
      actionType: "CONGRESS_RECEIVED",
      obj: response
    });
  },

  receiveFutureTasks: function(response) {
    AppDispatcher.dispatch({
      actionType: "FUTURE_TASKS_RECEIVED",
      tasks: response.tasks
    });
  },

  receiveErrors: function(response) {
    AppDispatcher.dispatch({
      actionType: "ERRORS_RECEIVED",
      errors: response.responseJSON
    });
  },

  receiveRecurringTasks: function(response) {
    AppDispatcher.dispatch({
      actionType: "RECURRING_TASKS_RECEIVED",
      dailyTasks: response.dailyTasks,
      weekendTasks: response.weekendTasks,
      monthlyTasks: response.monthlyTasks,
      users: response.users
    });
  },

  receiveRecurringTask: function(response) {
    AppDispatcher.dispatch({
      actionType: "RECURRING_TASK_RECEIVED",
      recurringTasks: response.recurringTasks,
      users: response.users
    });
  }
};

module.exports = ServerActions;
