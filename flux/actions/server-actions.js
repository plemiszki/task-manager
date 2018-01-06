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
  }
};

module.exports = ServerActions;
