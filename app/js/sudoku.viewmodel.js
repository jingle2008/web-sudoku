Function.prototype.inheritsFrom = function (parent) {
    if (parent.constructor == Function) {
        //Normal Inheritance 
        this.prototype = Object.create(parent.prototype);
        this.prototype.constructor = this;
        this.prototype.parent = parent.prototype;
    } else {
        //Pure Virtual Inheritance 
        this.prototype = parent;
        this.prototype.constructor = this;
        this.prototype.parent = parent;
    }

    return this;
};

function assert(condition, message) {
    if (!condition) {
        throw message || 'Assertion failed';
    }
}

/**
 * Model
 */
function Point(x, y) {
    var self = this;

    // Data
    self.x = x;
    self.y = y;
}

$.extend(Point.prototype, {
    equals: function (pos) {
        return (this.x === pos.x && this.y === pos.y);
    }
});

function RectangleRegion(tl, br) {
    assert(tl.x < br.x && tl.y < br.y);

    var self = this;

    // Data
    self.topLeft = tl;
    self.bottomRight = br;
}

$.extend(RectangleRegion.prototype, {
    contains: function (pos) {
        return (pos.x >= this.topLeft.x && pos.x <= this.bottomRight.x && pos.y >= this.topLeft.y && pos.y <= this.bottomRight.y);
    }
});

function SquareRegion(tl, size) {
    RectangleRegion.apply(this, [tl, new Point(tl.x + size - 1, tl.y + size - 1)]);
}

SquareRegion.inheritsFrom(RectangleRegion);

var DiagonalRegion = (function () {
    var primary;
    var secondary;

    function diagonalRegionImp(isPrimary, size) {
        var self = this;

        // Data
        self.isPrimary = isPrimary;
        self.size = size;
    }

    $.extend(diagonalRegionImp.prototype, {
        contains: function (pos) {
            return (this.primary ? (pos.x === pos.y) : (pos.x + pos.y + 1 === this.size));
        }
    });

    return {
        getPrimary: function () {
            if (!primary) {
                primary = new diagonalRegionImp(true);
            }

            return primary;
        },
        getSecondary: function (size) {
            if (!secondary) {
                secondary = new diagonalRegionImp(false, size);
            }

            return secondary;
        }
    };
})();

function ArbitraryRegion(listOfPoints) {
    var self = this;

    // Data
    self.listOfPoints = listOfPoints.slice(0);
}

$.extend(ArbitraryRegion.prototype, {
    contains: function (pos) {
        var fEquals = Point.prototype.equals.bind(pos);
        return (ko.utils.arrayFirst(this.listOfPoints, fEquals) !== null);
    }
});

function Command(name, func) {
    var self = this;

    self.name = name;
    self.func = function () {
        func();
        console.log(name);
    };
}

function CommandPanelViewModel(rowSize) {
    var self = this;
    var rowIndex = 0;
    var colIndex = 0;

    self.commands = [];
    self.addCommand = function (name, func) {
        if (colIndex == 0) {
            self.commands.push([]);
        }

        self.commands[rowIndex].push(new Command(name, func));

        colIndex++;
        if (colIndex % rowSize === 0) {
            rowIndex++;
            colIndex = 0;
        }
    };
}

var level = {
    id: 0,
    style: 0,
    difficulty: 0,
    timeUsed: 0,
    size: 9,
    cells: '000609080084010000500000300052003100000020000003500240006000008000080720070406000',
    fixed: [1, 3, 9, 16, 25, 36, 49, 64, 77]
};

function CellViewModel(value, fixed, row, column, level) {
    var self = this;

    // Data
    self.value = ko.observable();
    self.fixed = fixed || false;
    self.location = new Point(column, row);
    self.possibleValues = ko.observableArray();
    self.empty = ko.computed(function () {
        return self.value() === '0';
    });

    // UI state
    self.isSelected = ko.observable(false);
    self.isHighlighted = ko.observable(false);

    // Operation
    self.reset = function () {
        if (!self.fixed) {
            initialize('0');
        }
    };

    self.setValue = function (letter) {
        if (self.fixed) {
            return;
        }

        self.value(letter);
    };

    self.updatePossibleValues = function() {
        //if (self.value() == '0') {
        //    return;
        //}


    };

    // Private
    function initialize(val) {
        self.value(val);
        self.possibleValues(self.empty() ? ko.utils.range(1, 9) : []);
    }

    initialize(value);
}

function LevelViewModel(data) {
    var self = this;
    var fixed = [];

    // Data
    self.id = data.id;
    self.type = data.type;
    self.difficulty = data.difficulty;
    self.regionSize = data.size;
    self.timeUsed = ko.observable(data.timeUsed);
    self.cells = ko.observableArray();

    // Operation
    self.reset = function () {
        self.timeUsed(0);

        $.each(fixed, function (idx, elem) {
            if (!elem) {
                self.cells[idx].reset();
            }
        });
    };

    self.setCell = function (letter) {
        var idx = Math.floor(Math.random() * data.cells.length);
        self.cells()[idx].setValue(letter);
    };

    self.getCell = function (row, col) {
        if (row < 0 || row >= data.size || col < 0 || col >= data.size) {
            return null;
        }

        return self.cells()[row * data.size + col];
    };

    // Private
    function initialize() {
        $.each(data.fixed, function (idx, elem) {
            fixed[elem] = true;
        });

        for (var i = 0; i < data.cells.length; i++) {
            self.cells.push(new CellViewModel(data.cells[i], fixed[i], Math.floor(i / data.size), i % data.size, self));
        }

        $.each(self.cells(), function (idx, cell) {
            cell.updatePossibleValues();
        });
    }

    initialize();
}