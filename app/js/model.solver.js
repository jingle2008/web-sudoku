"use strict";

Cell.prototype.resolve = function() {
	if (this.isSolvable()) {
		this.setValue(this.candidates[0]);
	}
};

// Get all cells with unique value in set
function getUniqueValueCells(cells) {
	var dict = {};

	getEmptyCells(cells).forEach(function(cell) {
		cell.candidates.forEach(function(cand) {
			dict[cand] = dict[cand] || [];
			dict[cand].push(cell);
		});
	});

	var uniqueCells = [];
	for (var prop in dict) {
		if (dict[prop].length === 1) {
			var cell = dict[prop][0];
			cell.candidates.clear().push(prop);
			uniqueCells.push(cell);
		}
	}

	return uniqueCells;
}

Level.prototype.getUniqueValueCells = function() {
	var cellsInRow = Array.prototype.concat.apply([], this.rowCells.map(getUniqueValueCells));
	var cellsInCol = Array.prototype.concat.apply([], this.colCells.map(getUniqueValueCells));
	var cellsInReg = Array.prototype.concat.apply([], this.regCells.map(getUniqueValueCells));

	return [].concat(cellsInRow, cellsInCol, cellsInReg);
};

Level.prototype.getSolvableCells = function() {
	// find cells with only one candidate
	// and cells with unique values
	return this.flattenedCells.filter(function(cell) {
		return cell.isSolvable();
	}).concat(this.getUniqueValueCells()).unique();
};

/*=========================================
=            Solver Data Model            =
=========================================*/

function Solver(level) {
	var self = this;

	self.level = level;
	self.solvableCells = [];

	self.nextStep = function() {
		if (self.level.isSolved()) {
			return;
		}

		if (self.solvableCells.length === 0) {
			self.solvableCells = self.level.getSolvableCells();
		}

		if (self.solvableCells.length === 0) {
			console.log(self.level.toString());
			return null;
		}

		var cell = self.solvableCells.shift();

		if (cell !== null) {
			cell.resolve();
			self.dumpLevel();
		}

		return cell;
	};

	self.peekNext = function() {
		if (self.level.isSolved()) {
			return;
		}

		if (self.solvableCells.length === 0) {
			self.solvableCells = self.level.getSolvableCells();
		}

		var cell = self.solvableCells[0];

		if (cell !== null) {
			console.log(cell.row, cell.column, cell.candidates);
		}
	};
}

/*-----  End of Solver Data Model  ------*/