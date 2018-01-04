Tools = {

  sortArrayOfObjects: function(array, property) {
    return array.sort(function(a, b) {
      if (parseInt(a[property]) < parseInt(b[property])) {
        return -1;
      } else if (parseInt(a[property]) > parseInt(b[property])) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
