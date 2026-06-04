function layout() {
  return {
    name: "Grid",
    initialState: {},
    commands: {},
    getFrameAssignments: function (windows, screenFrame) {
      var n = windows.length;
      if (n === 0) return {};

      // Three windows: prefer two columns over two rows — one full-height
      // window on the left, two stacked on the right.
      if (n === 3) {
        var colW = screenFrame.width / 2;
        var stackH = screenFrame.height / 2;
        var threeUp = {};
        threeUp[windows[0].id] = {
          x: screenFrame.x,
          y: screenFrame.y,
          width: colW,
          height: screenFrame.height,
        };
        threeUp[windows[1].id] = {
          x: screenFrame.x + colW,
          y: screenFrame.y,
          width: colW,
          height: stackH,
        };
        threeUp[windows[2].id] = {
          x: screenFrame.x + colW,
          y: screenFrame.y + stackH,
          width: colW,
          height: stackH,
        };
        return threeUp;
      }

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
