var AppDispatcher = require('../dispatcher/dispatcher.js');
var ServerActions = require('../actions/server-actions.js');
import HandyTools from 'handy-tools';

var ClientActions = {

  standardFetch: function(directory, id) {
    $.ajax({
      url: `/api/${directory}/${id}`,
      type: 'GET',
      success: function(response) {
        switch (directory) {
        case 'recurring_tasks':
          ServerActions.receiveRecurringTask(response);
        }
      }
    });
  },

  standardCreate: function(directory, objKey, obj) {
    $.ajax({
      url: `/api/${directory}`,
      type: 'POST',
      data: {
        [objKey]: HandyTools.convertObjectKeysToUnderscore(obj)
      },
      success: function(response) {
        switch (directory) {
        case 'recurring_tasks':
          ServerActions.receiveRecurringTasks(response);
        case 'future_tasks':
          ServerActions.receiveFutureTasks(response);
        }
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  standardUpdate: function(directory, objKey, obj) {
    $.ajax({
      url: `/api/${directory}/${obj.id}`,
      type: 'PATCH',
      data: {
        [objKey]: HandyTools.convertObjectKeysToUnderscore(obj)
      },
      success: function(response) {
        switch (directory) {
        case 'recurring_tasks':
          ServerActions.receiveRecurringTask(response);
        }
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchUser: function() {
    $.ajax({
      url: '/api/user',
      type: 'GET',
      success: function(response) {
        ServerActions.receiveUser(response);
        ClientActions.fetchCongress();
      }
    });
  },

  fetchCongress: function() {
    $.ajax({
      url: '/api/congress',
      type: 'GET',
      success: function(response) {
        ServerActions.receiveCongress(response);
      }
    });
  },

  updateUser: function(user) {
    $.ajax({
      url: '/api/user',
      type: 'POST',
      data: {
        user: user
      },
      success: function(response) {
        ServerActions.receiveUser(response);
      }
    });
  },

  fetchTasks: function(timeframe) {
    $.ajax({
      url: '/api/tasks',
      type: 'GET',
      success: function(response) {
        ServerActions.receiveTasks(response);
      }
    });
  },

  addTask: function(timeframe, parent_id, task, newOrder) {
    if (task) {
      task = {
        text: task.text,
        color: task.color,
        duplicate_id: task.id,
        complete: task.complete,
        order: task.order,
        timeframe: timeframe
      };
    }
    $.ajax({
      url: '/api/tasks',
      type: "POST",
      data: {
        timeframe: timeframe,
        parent_id: parent_id,
        task: task,
        new_order: newOrder
      },
      success: function(response) {
        ServerActions.receiveTasks(response);
      },
      error: function() {
        alert("A duplicate of this task already exists!");
        ServerActions.receiveError();
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

  rearrangeTasks: function(hash) {
    $.ajax({
      url: '/api/tasks/rearrange',
      type: "PATCH",
      data: {
        tasks: hash
      },
      success: function(response) {
        ServerActions.receiveTasks(response);
      }
    });
  },

  fetchFutureTasks: function() {
    $.ajax({
      url: '/api/future_tasks',
      type: 'GET',
      success: function(response) {
        ServerActions.receiveFutureTasks(response);
      }
    });
  },

  createFutureTask: function(task) {
    $.ajax({
      url: '/api/future_tasks',
      type: 'POST',
      data: { future_task: task },
      success: function(response) {
        ServerActions.receiveFutureTasks(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  deleteFutureTask: function(id) {
    $.ajax({
      url: '/api/future_tasks/' + id,
      type: 'DELETE',
      success: function(response) {
        ServerActions.receiveFutureTasks(response);
      }
    });
  },

  fetchRecurringTasks: function() {
    $.ajax({
      url: '/api/recurring_tasks',
      type: 'GET',
      success: function(response) {
        ServerActions.receiveRecurringTasks(response);
      }
    });
  },

  deleteRecurringTask: function(id) {
    $.ajax({
      url: '/api/recurring_tasks/' + id,
      type: 'DELETE',
      success: function(response) {
        ServerActions.receiveRecurringTasks(response);
      }
    });
  },

  updateRecurringTask: function(recurringTask) {
    $.ajax({
      url: `/api/recurring_tasks/${recurringTask.id}`,
      type: 'PATCH',
      data: {
        recurring_task: HandyTools.convertObjectKeysToUnderscore(recurringTask)
      },
      success: function(response) {
        ServerActions.receiveRecurringTask(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  rearrangeRecurringTasks: function(newOrder) {
    $.ajax({
      url: '/api/recurring_tasks/rearrange',
      method: 'PATCH',
      data: {
        new_order: newOrder
      },
      success: function(response) {
        ServerActions.receiveRecurringTasks(response);
      }
    });
  }
};

module.exports = ClientActions;
