var React = require('react');

$(document).ready(function() {
  Common.initialize();
});

Common = {

  initialize: function() {
    $.fn.matchHeight._maintainScroll = true;
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
  },

  canIDrop: function($e) {
    draggedId = $e[0].getAttribute('id');
    draggedIdArray = draggedId.split('-');
    draggedTimeFrame = draggedIdArray[0];
    draggedParentId = draggedIdArray.length - 2 == 0 ? "" : draggedIdArray.slice(0, -1).join("-");
    draggedIndex = +draggedIdArray[draggedIdArray.length - 1];

    dropZoneId = this.getAttribute('id');
    dropZoneIdArray = dropZoneId.split('-');
    dropZoneTimeFrame = dropZoneIdArray[0];
    dropZoneParentId = dropZoneIdArray.length - 3 == 0 ? "" : dropZoneIdArray.slice(0, -2).join("-");
    dropZoneIndex = dropZoneIdArray[dropZoneIdArray.length - 2] == "top" ? -1 : +dropZoneIdArray[dropZoneIdArray.length - 2];

    if (draggedTimeFrame == dropZoneTimeFrame) {
      if (draggedParentId == dropZoneParentId) {
        var difference = Math.abs(draggedIndex - dropZoneIndex);
        if (difference >= 2) {
          return true;
        } else if (difference == 1 && draggedIndex < dropZoneIndex) {
          return true;
        }
      } else {
        return false;
      }
    } else {
      var numbers = {day: 1, weekend: 2, month: 3, year: 4, life: 5};
      if (dropZoneParentId == "" && (numbers[draggedTimeFrame] > numbers[dropZoneTimeFrame])) {
        return true;
      }
    }
  },

  dragOverHandler: function(e) {
    e.target.classList.add('highlight-black');
  },

  dragOutHandler: function(e) {
    e.target.classList.remove('highlight-black');
    e.target.classList.remove('highlight-blue');
  }
}

module.exports = Common;
