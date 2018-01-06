var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var ErrorsStore = new Store(AppDispatcher);

var _errors = [];

ErrorsStore.setErrors = function(errors) {
  _errors = errors;
};

ErrorsStore.all = function() {
  return _errors;
};

ErrorsStore.__onDispatch = function(payload) {
  switch (payload.actionType) {
    case "ERRORS_RECEIVED":
      this.setErrors(payload.errors);
      this.__emitChange();
      break;
  }
};

module.exports = ErrorsStore;
