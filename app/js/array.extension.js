"use strict";

/*========================================
=            Array Extensions            =
========================================*/

Array.prototype.unique = function() {
    var result = [];

    this.forEach(function(val) {
        if (!result.contains(val)) {
            result.push(val);
        }
    });

    return result;
};

Array.prototype.contains = function(value) {
    return (this.indexOf(value) !== -1);
};

Array.prototype.remove = function(value) {
    var index = this.indexOf(value);

    if (index !== -1) {
        this.splice(index, 1);
    }

    return this;
};

Array.prototype.removeAll = function(array) {
    if (!Array.isArray(array)) {
        return this.remove(array);
    }

    array.forEach(Array.prototype.remove.bind(this));

    return this;
};

Array.prototype.clear = function(value) {
    this.length = 0;
    return this;
};

Array.prototype.make2d = function(size) {
    this.clear();

    for (var i = 0; i < size; i++) {
        this.push([]);
    }

    return this;
};

Array.prototype.groupBy = function(fnKey) {
    var groups = {};

    this.forEach(function(obj) {
        var key = fnKey(obj);
        groups[key] = groups[key] || [];
        groups[key].push(obj);
    });

    return groups;
};

/*-----  End of Array Extensions  ------*/