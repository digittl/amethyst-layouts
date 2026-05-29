function layout() {
  return {
    name: "Grid",
    initialState: {},
    commands: {},
    getFrameAssignments: function (windows, screenFrame) {
      var n = windows.length;
      if (n === 0) return {};
      var cols = Math.ceil(Math.sqrt(n));
      var rows = Math.ceil(n / cols);
      var assignments = {};
      for (var i = 0; i < n; i++) {
        var row = Math.floor(i / cols);
        var col = i % cols;
        var isLastRow = row === rows - 1;
        var windowsInThisRow = isLastRow ? n - row * cols : cols;
        var w = screenFrame.width / windowsInThisRow;
        var h = screenFrame.height / rows;
        assignments[windows[i].id] = {
          x: screenFrame.x + col * w,
          y: screenFrame.y + row * h,
          width: w,
          height: h,
        };
      }
      return assignments;
    },
  };
}
