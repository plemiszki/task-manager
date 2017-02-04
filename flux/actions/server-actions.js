var AppDispatcher = require('../dispatcher/dispatcher.js');

var ServerActions = {

  receiveTasks: function(response) {
    AppDispatcher.dispatch({
      actionType: "TASKS_RECEIVED",
      tasks: response
    });
  }

};

module.exports = ServerActions;
