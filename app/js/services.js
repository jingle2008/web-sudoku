'use strict';

/* Services */

angular.module('sudokuApp.services', ['firebase'])
	.constant('firebaseUrl', 'https://websudoku.firebaseio.com')
	.factory('SudokuStore', ['$firebase', '$q', 'firebaseUrl', 'UserService',
		function($firebase, $q, firebaseUrl, UserService) {
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

					var counter = 0;
					var uid = UserService.getUserId();
					var path = [firebaseUrl, style, level, size];
					var puzzleRef = $firebase(new Firebase(path.join('/')));
					puzzleRef.$on('child_added', function(child) {
						var data = {
							id: child.snapshot.name,
							mask: child.snapshot.value.mask,
							puzzle: child.snapshot.value.puzzle
						};

						counter++;
						puzzles.push(data);

						if (uid) {
							getResult(data.id, uid).$on('value', function(self) {
								counter--;
								data.result = self.snapshot.value;

								if (counter === 0) {
									deferred.resolve(puzzles);
								}
							});
						}
					});

					puzzleRef.$on('loaded', function() {
						if (!uid) {
							deferred.resolve(puzzles);
						}
					});
				}

				return deferred.promise;
			}

			function saveScore(pid, uid, timeUsed) {
				saveResult(pid, uid, timeUsed, 1);
			}

			function saveGame(pid, uid, timeUsed, puzzle) {
				saveResult(pid, uid, timeUsed, 0, puzzle);
			}

			function resetGame(pid, uid) {
				getResult(pid, uid).$remove();
			}

			function saveResult(pid, uid, timeUsed, status, puzzle) {
				var result = {
					status: status,
					timeUsed: timeUsed
				};

				if (status === 0) {
					result.puzzle = puzzle;
				}

				getResult(pid, uid).$set(result);
			}

			function getResult(pid, uid) {
				var path = [firebaseUrl, 'Results', uid, pid];
				return $firebase(new Firebase(path.join('/')));
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
				getPuzzles: getPuzzles,
				saveScore: saveScore,
				saveGame: saveGame,
				resetGame: resetGame
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
	]).factory('UserService', ['$firebase', '$firebaseSimpleLogin', 'firebaseUrl',
		function($firebase, $firebaseSimpleLogin, firebaseUrl) {
			var userId = $.cookie('userId');
			var ref = new Firebase(firebaseUrl);

			return {
				getUserId: function() {
					return $.cookie('userId');
				},
				setUserId: function(userId) {
					$.cookie('userId', userId);
				},
				auth: $firebaseSimpleLogin(ref)
			};
		}
	]);