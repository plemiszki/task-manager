var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var ErrorStore = new Store(AppDispatcher);

ErrorStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "ERROR":
      this.__emitChange();
      break;
  }
};

module.exports = ErrorStore;
