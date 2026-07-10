const Common = {

  canIDrop: function($e) {
    const draggedId = $e[0].getAttribute('id');
    const draggedIdArray = draggedId.split('-');
    const draggedTimeFrame = draggedIdArray[0];
    const draggedParentId = draggedIdArray.length - 2 == 0 ? "" : draggedIdArray.slice(0, -1).join("-");
    const draggedIndex = +draggedIdArray[draggedIdArray.length - 1];

    const dropZoneId = this.getAttribute('id');
    const dropZoneIdArray = dropZoneId.split('-');
    const dropZoneTimeFrame = dropZoneIdArray[0];
    const dropZoneParentId = dropZoneIdArray.length - 3 == 0 ? "" : dropZoneIdArray.slice(0, -2).join("-");
    const dropZoneIndex = dropZoneIdArray[dropZoneIdArray.length - 2] == "top" ? -1 : +dropZoneIdArray[dropZoneIdArray.length - 2];

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
      const numbers = { day: 1, weekend: 2, month: 3, year: 4, life: 5, backlog: 6 };
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
  },

  resetNiceSelect: function(selector) {
    var $dropDowns = $(selector);
    $dropDowns.niceSelect('destroy');
    $dropDowns.niceSelect();
  }
}

export default Common;
