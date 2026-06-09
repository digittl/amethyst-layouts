function layout() {
  return {
    name: "Grid Equal",
    initialState: {},
    commands: {},
    getFrameAssignments: function (windows, screenFrame) {
      var n = windows.length;
      if (n === 0) {
        return {};
      }

      var sf = screenFrame;
      var aspect = sf.width / sf.height;
      var ultrawide = aspect >= 2.1;

      // Re-tiling stability: order windows by where they already are (top to
      // bottom, then left to right) before assigning cells, so each window lands
      // in the slot nearest its current spot instead of teleporting when the grid
      // reflows. Amethyst keys cells off its own internal window order, which
      // doesn't track on-screen position — that mismatch is what makes windows
      // jump around. Falls back to the given order if no live frames were handed in.
      var ROW_TOL = 40; // px; windows within this vertical band count as one row
      function readingOrder(list) {
        if (!list.length || !list[0].frame || typeof list[0].frame.y !== "number") {
          return list;
        }

        return list.slice().sort(function (a, b) {
          if (Math.abs(a.frame.y - b.frame.y) > ROW_TOL) {
            return a.frame.y - b.frame.y;
          }
          return a.frame.x - b.frame.x;
        });
      }

      function equalGrid(list, cols) {
        list = readingOrder(list);

        var out = {};
        var rows = Math.ceil(list.length / cols);
        var cellH = sf.height / rows;

        for (var i = 0; i < list.length; i++) {
          var row = Math.floor(i / cols);
          var col = i % cols;
          var inRow = row === rows - 1 ? list.length - row * cols : cols;
          var cellW = sf.width / inRow;
          out[list[i].id] = {
            x: sf.x + col * cellW,
            y: sf.y + row * cellH,
            width: cellW,
            height: cellH,
          };
        }
        return out;
      }

      if (ultrawide) {
        switch (n) {
          case 1:
            return equalGrid(windows, 1);
          case 2:
            return equalGrid(windows, 2);
          case 3:
            return equalGrid(windows, 3);
          case 4:
            return equalGrid(windows, 4);
          case 5:
          case 6:
            return equalGrid(windows, 3);
          case 7:
          case 8:
            return equalGrid(windows, 4);
          default:
            return equalGrid(windows, Math.ceil(n / 2));
        }
      }

      switch (n) {
        case 1:
          return equalGrid(windows, 1);
        case 2:
          return equalGrid(windows, 2);
        case 3:
        case 4:
          return equalGrid(windows, 2);
        case 5:
        case 6:
          return equalGrid(windows, 3);
        case 7:
        case 8:
          return equalGrid(windows, 4);
        default:
          return equalGrid(windows, Math.ceil(Math.sqrt(n)));
      }
    },
  };
}
