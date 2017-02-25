var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var UserStore = new Store(AppDispatcher);

var _user = {};

UserStore.setUser = function(user) {
  _user = user;
};

UserStore.user = function() {
  return _user;
};

UserStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "USER_RECEIVED":
      this.setUser(payload.user);
      this.__emitChange();
      break;
  }
};

module.exports = UserStore;
