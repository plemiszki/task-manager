var React = require('react');

$(document).ready(function() {
  Common.initialize();
});

Common = {

  initialize: function() {
    // $('.match-height').matchHeight();
  },

  renderDisabledButtonClass: function(fetching) {
    return fetching ? " disabled" : "";
  },

  renderGrayedOut: function(fetching) {
    if (fetching) {
      return(
        <div className="grayed-out"></div>
      );
    }
  },

  renderSpinner: function(fetching) {
    if (fetching) {
      return(
        <div className="spinner"></div>
      );
    }
  }
}

module.exports = Common
