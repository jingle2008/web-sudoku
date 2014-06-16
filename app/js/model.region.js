"use strict";

/*=============================
=            Point            =
=============================*/

function Point(x, y) {
    var self = this;

    // Data
    self.x = x;
    self.y = y;
}

Point.prototype.equals = function(pos) {
    return (this.x === pos.x && this.y === pos.y);
};

/*-----  End of Point  ------*/

/*===============================
=            Regions            =
===============================*/

function RectangleRegion(tl, br) {
    assert(tl.x < br.x && tl.y < br.y);

    var self = this;

    // Data
    self.topLeft = tl;
    self.bottomRight = br;
}

RectangleRegion.prototype.contains = function(pos) {
    return (pos.x >= this.topLeft.x && pos.x <= this.bottomRight.x && pos.y >= this.topLeft.y && pos.y <= this.bottomRight.y);
};

function SquareRegion(tl, size) {
    RectangleRegion.apply(this, [tl, new Point(tl.x + size - 1, tl.y + size - 1)]);
}

SquareRegion.inheritsFrom(RectangleRegion);

var DiagonalRegion = (function() {
    var primary;
    var secondary;

    function DiagonalRegionImp(isPrimary, size) {
        var self = this;

        // Data
        self.isPrimary = isPrimary;
        self.size = size;
    }

    DiagonalRegionImp.prototype.contains = function(pos) {
        return (this.primary ? (pos.x === pos.y) : (pos.x + pos.y + 1 === this.size));
    };

    return {
        getPrimary: function() {
            if (!primary) {
                primary = new DiagonalRegionImp(true);
            }

            return primary;
        },
        getSecondary: function(size) {
            if (!secondary) {
                secondary = new DiagonalRegionImp(false, size);
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

ArbitraryRegion.prototype.contains = function(pos) {
    return this.listOfPoints.some(function(point) {
        return point.equals(pos);
    });
};

/*-----  End of Regions  ------*/
