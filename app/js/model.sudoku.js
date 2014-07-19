'use strict';

var nineCands = '123456789';
var sixteenCands = 'ABCDEFGHIJKLMNOP';
var emptyCellVal = '0';

function getAllCands(size) {
    if (size === 9) {
        return nineCands.split('');
    } else if (size === 16) {
        return sixteenCands.split('');
    }

    assert(false, 'Only size 9 and 16 are supported.');
}

/*=======================================
=            Cell Data Model            =
=======================================*/

function Cell(value, fixed, row, column, regionId, puzzle) {
    var self = this;

    // Data
    self.value = '';
    self.fixed = fixed || false;
    self.location = new Point(column, row);
    self.regionId = regionId;
    self.candidates = [];
    self.puzzle = puzzle;

    // UI state
    self.selected = false;
    self.highlight = false;

    // Operation
    self.reset = function() {
        initialize(self.fixed ? value : emptyCellVal);
    };

    // Private
    function initialize(val) {
        self.value = val;

        if (self.empty()) {
            self.puzzle.emptyCells++;
        }

        if (self.options.smartCand && self.empty()) {
            self.candidates = puzzle.allCands.slice(0);
        } else {
            self.candidates = [];
        }
    }

    initialize(value);
}

Cell.prototype.options = {
    smartCand: true,
};

Cell.prototype.empty = function() {
    return (this.value === emptyCellVal);
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

    var top = this.puzzle.getCell(y - 1, x);
    var right = this.puzzle.getCell(y, x + 1);
    var bottom = this.puzzle.getCell(y + 1, x);
    var left = this.puzzle.getCell(y, x - 1);

    borders.push(this.getBorder(top, 0));
    borders.push(this.getBorder(right, 1));
    borders.push(this.getBorder(bottom, 2));
    borders.push(this.getBorder(left, 3));

    return borders.join(' ');
};

Cell.prototype.setValue = function(value) {
    this.value = value;
    this.candidates.clear();

    this.puzzle.emptyCells--;

    if (this.options.smartCand) {
        this.puzzle.update(this);
    }
};

Cell.prototype.unsetValue = function() {
    this.value = emptyCellVal;
    this.puzzle.emptyCells++;
};

Cell.prototype.inputValue = function(value) {
    if (this.fixed) {
        return;
    }

    if (this.value === value) {
        this.unsetValue();
        return;
    }

    if (this.candidates.contains(value)) {
        this.candidates.remove(value);

        if (this.isSolvable()) {
            this.setValue(this.candidates[0]);
        }

        return;
    }

    if (!this.empty()) {
        this.candidates.push(this.value);
        this.unsetValue();
    }

    if (this.candidates.length > 0) {
        this.candidates.push(value);
        return;
    }

    this.setValue(value);
};

Cell.prototype.hasCand = function(cand) {
    return this.candidates.contains(cand);
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

// Get all filled cells in set
function getFilledCells(cells) {
    return cells.filter(function(cell) {
        return !cell.empty();
    });
}

function getCellValue(cell) {
    return cell.value;
}

// Get all duplicate cells in set
function getDuplicateCells(cells) {
    var dict = getFilledCells(cells).groupBy(getCellValue);

    var dupArray = [];
    for (var prop in dict) {
        if (dict[prop].length > 1) {
            dupArray.push(dict[prop]);
        }
    }

    return dupArray;
}

// Remove candidates from all cells
function removeCandidate(cells, candidates) {
    cells.forEach(function(cell) {
        cell.candidates.removeAll(candidates);
    });
}

/*-----  End of Utility Functions  ------*/

function HighlightGroup(cells) {
    var self = this;
    var state = false;

    self.highlight = function(on) {
        state = on;

        cells.forEach(function(cell) {
            cell.highlight = on;
        });
    };

    self.add = function(cell) {
        if (cells.contains(cell)) {
            return;
        }

        cell.highlight = state;
        cells.push(cell);
    };

    self.remove = function(cell) {
        cell.highlight = false;
        cells.remove(cell);
    };
}

function HighlightManager() {
    var self = this;
    var groups = {};
    var currentValue = null;

    function getGroup(value) {
        groups[value] = groups[value] || new HighlightGroup([]);
        return groups[value];
    }

    self.build = function(cells) {
        groups = {};
        var dict = cells.groupBy(getCellValue);

        for (var key in dict) {
            groups[key] = new HighlightGroup(dict[key]);
        }
    };

    self.highlight = function(value) {
        if (currentValue === value) {
            return;
        }

        getGroup(currentValue).highlight(false);
        currentValue = value;
        getGroup(currentValue).highlight(true);
    };

    self.update = function(cell, oldValue) {
        if (cell.empty()) {
            getGroup(oldValue).remove(cell);
        } else {
            getGroup(cell.value).add(cell);
        }
    };
}

/*========================================
=            Puzzle Data Model           =
========================================*/

function Puzzle(data, size) {
    var self = this;
    var activeCell = null;
    var highlightMgr = new HighlightManager();

    // Data
    self.cells = [];
    self.rowCells = [];
    self.colCells = [];
    self.regCells = [];
    self.emptyCells = 0;
    self.size = size;
    self.id = data.id;
    self.completed = data.result ? data.result.status > 0 : false;
    self.timeUsed = data.result ? data.result.timeUsed : 0;
    self.allCands = self.getValues();

    // Operation
    self.reset = function() {
        data.result = null;
        self.timeUsed = 0;
        self.completed = false;
        self.emptyCells = 0;
        var filledCells = [];

        self.cells.forEach(function(cell) {
            if (!cell.fixed) {
                cell.reset();
            } else {
                filledCells.push(cell);
            }
        });

        setupPlay(filledCells);
        console.log(self.emptyCells);
    };

    self.setCell = function(value) {
        if (activeCell === null || activeCell.fixed) {
            return;
        }

        var oldValue = activeCell.value;
        activeCell.inputValue(value);

        highlightMgr.update(activeCell, oldValue);
        highlightMgr.highlight(value);
    };

    self.selectCell = function(cell) {
        if (!cell.empty()) {
            highlightMgr.highlight(cell.value);
        }

        if (cell === activeCell) {
            return;
        }

        if (activeCell !== null) {
            activeCell.selected = false;
        }

        cell.selected = true;
        activeCell = cell;
    };

    self.selectNextCell = function(xOffset, yOffset) {
        if (activeCell === null) {
            self.selectCell(self.getCell(0, 0));
        }

        var x = (activeCell.location.x + xOffset + size) % size;
        var y = (activeCell.location.y + yOffset + size) % size;

        self.selectCell(self.getCell(y, x));
    };

    // Private
    function setupPlay(filledCells) {
        if (Cell.prototype.options.smartCand) {
            filledCells.forEach(Puzzle.prototype.update.bind(self));
        }

        highlightMgr.build(filledCells);
    }

    function initialize() {
        var index = 0;
        var filledCells = [];
        var puzzleString = data.puzzle;
        var loadedState = (data.result && data.result.status === 0);
        if (loadedState) {
            puzzleString = data.result.puzzle;
        }

        self.rowCells.make2d(size);
        self.colCells.make2d(size);
        self.regCells.make2d(size);

        for (var r = 0; r < size; r++) {
            for (var c = 0; c < size; c++) {
                var fixed = data.mask[index] === '0';
                var value = (fixed || loadedState || self.completed) ? puzzleString[index] : emptyCellVal;
                var rid = Math.floor(r / 3) * 3 + Math.floor(c / 3);
                var cell = new Cell(value, fixed, r, c, rid, self);

                self.rowCells[r].push(cell);
                self.colCells[c].push(cell);
                self.regCells[rid].push(cell);
                self.cells.push(cell);

                if (!self.completed && !cell.empty()) {
                    filledCells.push(cell);
                }

                index++;
            }
        }

        if (!self.completed) {
            setupPlay(filledCells);
        }
    }

    initialize();
}

Puzzle.prototype.getCell = function(row, col) {
    var size = this.size;

    if (row < 0 || row >= size || col < 0 || col >= size) {
        return null;
    }

    return this.cells[row * size + col];
};

Puzzle.prototype.getValues = function() {
    return getAllCands(this.size);
};

Puzzle.prototype.checkSolved = function() {
    if (this.emptyCells !== 0) {
        return false;
    }

    this.completed = this.validate();

    return this.completed;
};

Puzzle.prototype.validate = function() {
    return !(this.rowCells.some(function(cells) {
        return getDuplicateCells(cells).length > 0;
    }) || this.colCells.some(function(cells) {
        return getDuplicateCells(cells).length > 0;
    }) || this.regCells.some(function(cells) {
        return getDuplicateCells(cells).length > 0;
    }));
};

Puzzle.prototype.autoResolve = function() {
    this.cells.forEach(function(cell) {
        if (cell.isSolvable()) {
            cell.setValue(cell.candidates[0]);
        }
    });
};

Puzzle.prototype.getCellsInRow = function(row) {
    return getEmptyCells(this.rowCells[row]);
};

Puzzle.prototype.getCellsInCol = function(column) {
    return getEmptyCells(this.colCells[column]);
};

Puzzle.prototype.getCellsInReg = function(regionId) {
    return getEmptyCells(this.regCells[regionId]);
};

Puzzle.prototype.getSameValCells = function(value) {
    return this.cells.filter(function(cell) {
        return (value === cell.value);
    });
};

Puzzle.prototype.getCellValues = function() {
    return this.cells.map(function(cell) {
        return cell.value;
    });
};

Puzzle.prototype.update = function(cell) {
    if (cell.empty()) {
        return;
    }

    // update affected cells
    removeCandidate(
        [].concat(
            this.getCellsInRow(cell.location.y),
            this.getCellsInCol(cell.location.x),
            this.getCellsInReg(cell.regionId)
        ).unique(), [cell.value]);
};

Puzzle.prototype.updateRow = function(row, candidates) {
    // update affected cells
    removeCandidate(this.getCellsInRow(row), candidates);
};

Puzzle.prototype.updateColumn = function(column, candidates) {
    // update affected cells
    removeCandidate(this.getCellsInCol(column), candidates);
};

Puzzle.prototype.updateRegion = function(region, candidates) {
    // update affected cells
    removeCandidate(this.getCellsInReg(region), candidates);
};

Puzzle.prototype.enableSmartCand = function(enable) {
    Cell.prototype.options.smartCand = enable;

    //this.cells.forEach(Puzzle.prototype.update.bind(self));
};

/*-----  End of Puzzle Data Model  ------*/