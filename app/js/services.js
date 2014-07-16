'use strict';

/* Services */

angular.module('sudokuApp.services', ['firebase'])
	.constant('firebaseUrl', 'https://websudoku.firebaseio.com')
	.factory('SudokuStore', ['$firebase', '$q', 'firebaseUrl',
		function($firebase, $q, firebaseUrl) {
			var regions = [
				'No extra regions',
				'X-Sudoku',
				'Hyper-Sudoku',
				'Percent-Sudoku',
				'Color-Sudoku'
			];
			var styles = [
				'Standard',
				'Squiggly'
			];
			var levels = [
				'Easy', 'Medium', 'Hard', 'Evil'
			];
			var loadedPuzzles = {};

			function getPuzzles(style, level, size) {
				var deferred = $q.defer();

				var key = [style, level, size].join();
				var puzzles = loadedPuzzles[key];
				if (puzzles !== undefined) {
					deferred.resolve(puzzles);
				} else {
					loadedPuzzles[key] = puzzles = [];

					var path = [firebaseUrl, style, level, size];
					var puzzleRef = $firebase(new Firebase(path.join('/')));
					puzzleRef.$on('child_added', function(child) {
						puzzles.push(child.snapshot.value);
					});

					puzzleRef.$on('loaded', function() {
						deferred.resolve(puzzles);
					});
				}

				return deferred.promise;
			}

			function getRegions(level) {
				return regions;
			}

			function getStyles() {
				return styles;
			}

			function getLevels() {
				return levels;
			}

			return {
				getLevels: getLevels,
				getRegions: getRegions,
				getStyles: getStyles,
				getPuzzles: getPuzzles
			};
		}
	])
	.factory('GameOption', ['SudokuStore',
		function(SudokuStore) {
			var style = 0;
			var region = 0;
			var level = 0;
			var size = 9;

			return {
				style: style,
				region: region,
				level: level,
				size: size,
				styles: SudokuStore.getStyles(),
				regions: SudokuStore.getRegions(),
				levels: SudokuStore.getLevels(),
				styleName: function() {
					return this.styles[this.style];
				},
				regionName: function() {
					return this.regions[this.region];
				},
				levelName: function() {
					return this.levels[this.level];
				}
			};
		}
	]).factory('User', ['$firebase', '$firebaseSimpleLogin', 'firebaseUrl',
		function($firebase, $firebaseSimpleLogin, firebaseUrl) {
			var ref = new Firebase(firebaseUrl);
			return $firebaseSimpleLogin(ref);
		}
	]);