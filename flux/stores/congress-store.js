var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var CongressStore = new Store(AppDispatcher);

var _obj = {};

CongressStore.setObject = function(obj) {
  _obj= obj;
};

CongressStore.obj = function(timeframe) {
  return _obj;
};

CongressStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "CONGRESS_RECEIVED":
      this.setObject(payload.obj);
      this.__emitChange();
      break;
  }
};

module.exports = CongressStore;
