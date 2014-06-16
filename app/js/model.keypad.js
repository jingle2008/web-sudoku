"use strict";

function Key(text, command) {
    var self = this;

    self.text = text;
    self.command = function() {
        command(text);
    };
}

function Keypad(rowSize) {
    var self = this;
    var rowIndex = 0;
    var colIndex = 0;

    self.keys = [];
    self.addKey = function(text, command) {
        if (colIndex === 0) {
            self.keys.push([]);
        }

        self.keys[rowIndex].push(new Key(text, command));

        colIndex++;
        if (colIndex % rowSize === 0) {
            rowIndex++;
            colIndex = 0;
        }
    };
}

Keypad.prototype.addKeys = function(keys, command) {
    var self = this;

    keys.forEach(function(key) {
        self.addKey(key, command);
    });
};