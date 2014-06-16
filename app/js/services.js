'use strict';

/* Services */

angular.module('sudokuApp.services', ['firebase'])
	.factory('SudokuStore', ['$firebase',
		function($firebase) {
			var url = 'https://websudoku.firebaseio.com';
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
			var puzzles = [];
			// var curStyle, curLevel;

			// function styleUrl() {
			// 	return url + '/' + curStyle;
			// }

			// function levelUrl() {
			// 	return styleUrl() + '/' + curLevel;
			// }

			// function getChildren(path, children) {
			// 	var ref = new Firebase(path);
			// 	ref.once('value', function(snapshot) {
			// 		snapshot.forEach(function(child) {
			// 			children.push(child.name());
			// 		});
			// 	});
			// }

			function getRegions(level) {
				return regions;
			}

			function getStyles() {
				return styles;
			}

			function getLevels() {
				return levels;
			}

			function getPuzzles(style, level, size) {
				// var path = [url, style, level, size];
				// var ref = new Firebase(path.join('/'));
				// ref.on('child_added', function(snapshot) {
				// 	puzzles.push(snapshot.val());
				// });

				// return puzzles;
				var ref = new Firebase(url);
				ref.set({
					levels: [1, 2, 3],
					styles: 'test'
				});
				console.log(ref.name());
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
	]);