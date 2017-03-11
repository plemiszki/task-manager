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
  }
};

module.exports = ServerActions;
