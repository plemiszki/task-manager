Tools = {

  removeFromArray: function(array, element) {
    var index = array.indexOf(element);
    if (index >= 0) {
      array.splice(index, 1);
    }
    return array;
  },

  sortArrayOfDateStrings: function(array, property) {
    return array.sort(function(a, b) {
      if (+moment(a[property]).format('x') < +moment(b[property]).format('x')) {
        return -1;
      } else if (+moment(a[property]).format('x') > +moment(b[property]).format('x')) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
