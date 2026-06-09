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

      // Re-tiling stability: order windows by where they already are (top to
      // bottom, then left to right) before assigning cells, so each window lands
      // in the slot nearest its current spot instead of teleporting when the grid
      // reflows (a new window opening, a swap, a layout switch). Amethyst keys
      // cells off its own internal window order, which doesn't track on-screen
      // position — that mismatch is what makes windows jump around. Falls back to
      // the given order untouched if Amethyst didn't hand us live frames.
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

      // Lay `list` into `cols` equal columns (rows = ceil(len / cols)), every row
      // filling the full width so the last, short row widens to close any gap.
      // Cells are uniform within a row, so the rect is covered without overlap.
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

      // list[0] becomes a full-height master column on the left — `factor`x the
      // width of a stack column, so it is always the largest window — and the
      // rest tile into `stackCols` columns on the right. This is where a window
      // promoted to Amethyst's main slot (e.g. the browser) lands. `factor`
      // defaults to a clear 1.5x; pass a smaller value for just a slight edge.
      function masterGrid(list, stackCols, factor) {
        factor = factor || 1.5;

        // list[0] is Amethyst's main window (Hammerspoon pins Chrome there), so
        // it always takes the master column. Only the stack is position-sorted,
        // so the rest hold their places as the grid reflows.
        var stack = readingOrder(list.slice(1));
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
      // (5, 7) get a focus master (Hammerspoon ensures Chrome holds that slot).
      if (ultrawide) {
        switch (n) {
          case 1:
            return equalGrid(windows, 1);
          case 2:
            return equalGrid(windows, 2);
          case 3:
            return masterGrid(windows, 2, 1.6);
          case 4:
            return masterGrid(windows, 3, 1.5);
          case 5:
            return masterGrid(windows, 2);
          case 6:
            return equalGrid(windows, 3); // 3×2
          case 7:
            return masterGrid(windows, 3);
          case 8:
            return equalGrid(windows, 4); // 4×2
          default:
            return equalGrid(windows, Math.ceil(n / 2)); // two rows of columns
        }
      }

      // Normal (≈16:9) — columns get narrow fast, so favour balanced near-square
      // grids. Three and four windows use a master column (Hammerspoon ensures
      // Chrome holds that slot); past that, plain grids read best.
      switch (n) {
        case 1:
          return equalGrid(windows, 1);
        case 2:
          return equalGrid(windows, 2);
        case 3:
          return masterGrid(windows, 1);
        case 4:
          return masterGrid(windows, 1); // master+3 stacked
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
