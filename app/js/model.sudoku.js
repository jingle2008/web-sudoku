'use strict';

var nineDigits = '123456789';
var sixteenDigits = 'ABCDEFGHIJKLMNOP';

function getLetters(size) {
    if (size === 9) {
        return nineDigits.split('');
    } else if (size === 16) {
        return sixteenDigits.split('');
    }

    assert(false, 'Only size 9 and 16 are supported.');
}

/*=======================================
=            Cell Data Model            =
=======================================*/

function Cell(value, fixed, row, column, regionId, level) {
    var self = this;

    // Data
    self.value = '';
    self.fixed = fixed || false;
    self.location = new Point(column, row);
    self.regionId = regionId;
    self.candidates = [];
    self.level = level;

    // UI state
    self.selected = false;
    self.highlight = false;

    // Operation
    self.reset = function() {
        initialize(self.fixed ? value : '0');
    };

    // Private
    function initialize(val) {
        self.value = val;

        if (self.smartCand && self.empty()) {
            self.candidates = getLetters(level.size);
        } else {
            self.candidates = [];
        }
    }

    initialize(value);
}

Cell.prototype.options = {
    smartCand: false,
};

Cell.prototype.empty = function() {
    return (this.value === '0');
};

Cell.prototype.isSolvable = function() {
    return (this.candidates.length === 1);
};

Cell.prototype.getBorder = function(cell, dir) {
    if (cell === null) {
        return 4;
    }

    if (cell.regionId === this.regionId) {
        switch (dir) {
            case 0:
            case 3:
                return 0;
            case 1:
            case 2:
                return 1;
        }
    }

    return 2;
};

Cell.prototype.getBorders = function() {
    var borders = [];
    var x = this.location.x;
    var y = this.location.y;

    var top = this.level.getCell(y - 1, x);
    var right = this.level.getCell(y, x + 1);
    var bottom = this.level.getCell(y + 1, x);
    var left = this.level.getCell(y, x - 1);

    borders.push(this.getBorder(top, 0));
    borders.push(this.getBorder(right, 1));
    borders.push(this.getBorder(bottom, 2));
    borders.push(this.getBorder(left, 3));

    return borders.join(' ');
};

Cell.prototype.setValue = function(value) {
    if (this.fixed) {
        return;
    }

    if (this.value === value) {
        this.value = '0';
        return;
    }

    if (this.candidates.contains(value)) {
        this.candidates.remove(value);

        if (this.isSolvable()) {
            this.value = this.candidates[0];
            this.candidates.clear();
        }

        return;
    }

    if (!this.empty()) {
        this.candidates.push(this.value);
        this.value = '0';
    }

    if (this.candidates.length > 0) {
        this.candidates.push(value);
        return;
    }

    this.value = value;

    if (this.smartCand) {
        this.candidates.clear();
        this.level.update(this);
    }
};

/*-----  End of Cell Data Model  ------*/

/*=========================================
=            Utility Functions            =
=========================================*/

// Get all empty cells in set
function getEmptyCells(cells) {
    return cells.filter(function(cell) {
        return cell.empty();
    });
}

// Remove candidates from all cells
function removeCandidate(cells, candidates) {
    cells.forEach(function(cell) {
        cell.candidates.removeAll(candidates);
    });
}

/*-----  End of Utility Functions  ------*/

/*========================================
=            Level Data Model            =
========================================*/

function Level(data, size) {
    var self = this;
    var fixed = [];
    var activeCell = null;
    var sameValCells = [];
    var highlightVal = null;

    // Data
    self.cells = [];
    self.rowCells = [];
    self.colCells = [];
    self.regCells = [];
    self.emptyCells = 0;

    // Operation
    self.reset = function() {
        fixed.forEach(function(elem, idx) {
            if (!elem) {
                self.cells[idx].reset();
            }
        });
    };

    self.setCell = function(letter) {
        if (activeCell === null || activeCell.fixed) {
            return;
        }

        activeCell.setValue(letter);

        if (highlightVal === letter) {
            activeCell.highlight = true;
            sameValCells.push(activeCell);
        } else {
            self.highlightVals(letter);
        }
    };

    self.highlightVals = function(val) {
        if (highlightVal === val) {
            return;
        }

        highlightVal = val;

        sameValCells.forEach(function(cell) {
            cell.highlight = false;
        });

        var cells = self.getSameValCells(val);
        cells.forEach(function(cell) {
            cell.highlight = true;
        });

        sameValCells = cells;
    };

    self.selectCell = function(cell) {
        if (cell === activeCell) {
            return;
        }

        if (activeCell !== null) {
            activeCell.selected = false;
        }

        cell.selected = true;
        activeCell = cell;

        if (!cell.empty()) {
            self.highlightVals(cell.value);
        }
    };

    self.getCell = function(row, col) {
        if (row < 0 || row >= size || col < 0 || col >= size) {
            return null;
        }

        return self.cells[row * size + col];
    };

    // Private
    function initialize() {
        var index = 0;
        var filledCells = [];

        self.rowCells.make2d(size);
        self.colCells.make2d(size);
        self.regCells.make2d(size);

        for (var r = 0; r < size; r++) {
            for (var c = 0; c < size; c++) {
                var empty = data.mask[index] === '1';
                var value = empty ? '0' : data.puzzle[index];
                var rid = Math.floor(r / 3) * 3 + Math.floor(c / 3);
                var cell = new Cell(value, !empty, r, c, rid, self);

                self.rowCells[r].push(cell);
                self.colCells[c].push(cell);
                self.regCells[rid].push(cell);
                self.cells.push(cell);

                if (!empty) {
                    filledCells.push(cell);
                }

                index++;
            }
        }

        self.emptyCells = index;
        if (Cell.prototype.smartCand) {
            filledCells.forEach(Level.prototype.update.bind(self));
        }
    }

    initialize();
}

Level.prototype.isSolved = function() {
    return (this.emptyCells === 0);
};

Level.prototype.getCellsInRow = function(row) {
    return getEmptyCells(this.rowCells[row]);
};

Level.prototype.getCellsInCol = function(column) {
    return getEmptyCells(this.colCells[column]);
};

Level.prototype.getCellsInReg = function(regionId) {
    return getEmptyCells(this.regCells[regionId]);
};

Level.prototype.getSameValCells = function(value) {
    return this.cells.filter(function(cell) {
        return (value === cell.value);
    });
};

Level.prototype.update = function(cell) {
    if (cell.empty()) {
        return;
    }

    // remove from empty list
    this.emptyCells--;

    // update affected cells
    removeCandidate(
        [].concat(
            this.getCellsInRow(cell.row, true),
            this.getCellsInCol(cell.column, true),
            this.getCellsInReg(cell.regionId, true)
        ).unique(), [cell.value]);
};

Level.prototype.updateRow = function(row, candidates) {
    // update affected cells
    removeCandidate(this.getCellsInRow(row, true), candidates);
};

Level.prototype.updateColumn = function(column, candidates) {
    // update affected cells
    removeCandidate(this.getCellsInCol(column, true), candidates);
};

Level.prototype.updateRegion = function(region, candidates) {
    // update affected cells
    removeCandidate(this.getCellsInReg(region, true), candidates);
};

/*-----  End of Level Data Model  ------*/