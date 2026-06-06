function layout() {
  return {
    name: "Grid",
    initialState: {},
    commands: {},
    getFrameAssignments: function (windows, screenFrame) {
      var n = windows.length;
      if (n === 0) {
        return {};
      }

      var sf = screenFrame;
      var aspect = sf.width / sf.height; // 16:9 ≈ 1.78, 21:9 ≈ 2.4, 32:9 ≈ 3.6
      var ultrawide = aspect >= 2.1;

      // Lay `list` into `cols` equal columns (rows = ceil(len / cols)), every row
      // filling the full width so the last, short row widens to close any gap.
      // Cells are uniform within a row, so the rect is covered without overlap.
      function equalGrid(list, cols) {
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

      // list[0] becomes a full-height master column on the left — `factor`x the
      // width of a stack column, so it is always the largest window — and the
      // rest tile into `stackCols` columns on the right. This is where a window
      // promoted to Amethyst's main slot (e.g. the browser) lands. `factor`
      // defaults to a clear 1.5x; pass a smaller value for just a slight edge.
      function masterGrid(list, stackCols, factor) {
        factor = factor || 1.5;
        var stack = list.slice(1);
        var stackRows = Math.ceil(stack.length / stackCols);

        // Solving masterW = factor * (width - masterW) / stackCols for masterW:
        var masterW = (factor * sf.width) / (stackCols + factor);
        var stackW = sf.width - masterW;
        var rowH = sf.height / stackRows;

        var out = {};
        out[list[0].id] = {
          x: sf.x,
          y: sf.y,
          width: masterW,
          height: sf.height,
        };

        for (var i = 0; i < stack.length; i++) {
          var row = Math.floor(i / stackCols);
          var col = i % stackCols;
          var inRow = row === stackRows - 1 ? stack.length - row * stackCols : stackCols;
          var cellW = stackW / inRow;
          out[stack[i].id] = {
            x: sf.x + masterW + col * cellW,
            y: sf.y + row * rowH,
            width: cellW,
            height: rowH,
          };
        }
        return out;
      }

      // Widescreen — full-height columns are natural, so spread out. Counts that
      // divide into a balanced grid get a uniform one; the awkward odd counts
      // (5, 7) drop the spare window into a focus master with the rest beside it.
      if (ultrawide) {
        switch (n) {
          case 1:
            return equalGrid(windows, 1);
          case 2:
            return equalGrid(windows, 2);
          case 3:
            return masterGrid(windows, 2, 1.6); // master + 2 columns, master clearly wider
          case 4:
            return masterGrid(windows, 3, 1.3); // four columns, master slightly wider
          case 5:
            return masterGrid(windows, 2); // master + 2×2
          case 6:
            return equalGrid(windows, 3); // 3×2
          case 7:
            return masterGrid(windows, 3); // master + 3×2
          case 8:
            return equalGrid(windows, 4); // 4×2
          default:
            return equalGrid(windows, Math.ceil(n / 2)); // two rows of columns
        }
      }

      // Normal (≈16:9) — columns get narrow fast, so favour balanced near-square
      // grids. Three windows are the one focus case worth a master (one big + two
      // stacked); past that, plain grids read best.
      switch (n) {
        case 1:
          return equalGrid(windows, 1);
        case 2:
          return equalGrid(windows, 2);
        case 3:
          return masterGrid(windows, 1); // master + 2 stacked
        case 4:
          return equalGrid(windows, 2); // 2×2
        case 5:
        case 6:
          return equalGrid(windows, 3); // 3 columns
        case 7:
        case 8:
          return equalGrid(windows, 4); // 4 columns
        default:
          return equalGrid(windows, Math.ceil(Math.sqrt(n)));
      }
    },
  };
}
