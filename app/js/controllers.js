'use strict';

/* Controllers */

angular.module('sudokuApp.controllers', ['toggle-switch', 'sudokuApp.directives', 'sudokuApp.services', 'cfp.hotkeys'])
	.controller('MainMenuCtrl', ['$scope',
		function($scope) {
			$scope.isResumable = false;
		}
	])
	.controller('LoginCtrl', ['$scope', 'User',
		function($scope, User) {
			$scope.auth = User;
			$scope.busy = false;
			$scope.message = null;
			$scope.close = false;

			$scope.signIn = function(email, password, rememberMe) {
				$scope.busy = true;
				$scope.message = null;

				$scope.auth.$login('password', {
					email: email,
					password: password,
					rememberMe: rememberMe
				}).then(function(user) {
					$scope.busy = false;
					$scope.close = true;
				}, function(error) {
					$scope.busy = false;
					$scope.message = error.message;
				});
			};
		}
	])
	.controller('StartNewCtrl', ['$scope', 'GameOption',
		function($scope, GameOption) {
			$scope.numSolved = 100;
			$scope.averageTime = 100;
			$scope.fastestTime = 100;

			var config = $scope.config = GameOption;

			$scope.selectStyle = function(r) {
				config.style = config.styles.indexOf(r);
			};

			$scope.selectRegion = function(o) {
				config.region = config.regions.indexOf(o);
			};

			$scope.selectLevel = function(o) {
				config.level = config.levels.indexOf(o);
			};
		}
	])
	.controller('SettingsCtrl', ['$scope',
		function($scope) {
			var config = $scope.config = {
				name: 'Settings',
				fullscreen: true,
				scheme: 0,
				schemeList: ['Classic', 'Dark'],
				region: 0,
				regionList: [
					'Never',
					'Standard',
					'Squiggly',
					'Always'
				],
				input: 0,
				inputList: [
					'Cell Then Values',
					'Value Then Cells',
					'Automatic'
				],
				highlight: 0,
				highlightList: [
					'Never',
					'Single Values',
					'Single & Multiple'
				]
			};

			$scope.selectScheme = function(r) {
				config.scheme = config.schemeList.indexOf(r);
			};

			$scope.selectInput = function(o) {
				config.input = config.inputList.indexOf(o);
			};

			$scope.selectRegion = function(o) {
				config.region = config.regionList.indexOf(o);
			};

			$scope.selectHighlight = function(o) {
				config.highlight = config.highlightList.indexOf(o);
			};
		}
	])
	.controller('RankingsCtrl', ['$scope',
		function($scope) {
			$scope.name = 'Leader Boards';
		}
	])
	.controller('GamePlayCtrl', ['$scope', 'hotkeys', 'GameOption', 'SudokuStore',
		function($scope, hotkeys, GameOption, SudokuStore) {
			var puzzles = [];
			var puzzleData = [];

			$scope.puzzleId = 0;
			$scope.totalPuzzles = 'NA';
			$scope.timerAction = '';
			$scope.readonly = true;
			$scope.solved = false;
			$scope.loading = true;
			$scope.emptyLevel = false;

			$scope.prevPuzzle = function() {
				if ($scope.canGoPrev()) {
					$scope.puzzleId--;
					$scope.puzzle = getPuzzle();
				}
			};

			$scope.nextPuzzle = function() {
				if ($scope.canGoNext()) {
					$scope.puzzleId++;
					$scope.puzzle = getPuzzle();
				}
			};

			$scope.canGoPrev = function() {
				return ($scope.puzzleId > 0);
			};

			$scope.canGoNext = function() {
				return ($scope.puzzleId + 1 < $scope.totalPuzzles);
			};

			$scope.startGame = function() {
				$scope.readonly = false;
				$scope.timerAction = 'start';
			};

			$scope.submitScore = function() {
				alert('not implemented');
			};

			$scope.nextGame = function() {
				$scope.readonly = true;
				$scope.solved = false;
				$scope.nextPuzzle();
			};

			function getPuzzle() {
				var idx = $scope.puzzleId;
				var puzzle = puzzles[idx];
				if (puzzle === undefined) {
					puzzles[idx] = puzzle = new Puzzle(puzzleData[idx], GameOption.size);
				}

				return puzzle;
			}

			function keyPress(letter) {
				if ($scope.readonly) {
					return;
				}

				$scope.puzzle.setCell(letter);
				checkSolved();
			}

			function checkSolved() {
				if ($scope.puzzle.checkSolved()) {
					$scope.timerAction = 'stop';
					$scope.solved = true;
				}
			}

			function setupInputMethods() {
				var keys = $scope.puzzle.getValues();

				createKeypad(keys);
				createHotkeys(keys);
			}

			function createKeypad(keys) {
				var keypad = new Keypad(Math.sqrt(keys.length));
				keypad.addKeys(keys, keyPress);

				keypad.addKey('Smart', function() {
					Cell.prototype.options.smartCand = true;
					$scope.puzzle.enableSmartCand(true);
				});

				keypad.addKey('Auto', function() {
					$scope.puzzle.autoResolve();
					checkSolved();
				});

				keypad.addKey('Reset', function() {
					$scope.puzzle.reset();
				});

				$scope.keypad = keypad;
			}

			function createHotkeys(keys) {
				hotkeys.bindTo($scope);
				keys.forEach(function(key) {
					hotkeys.add(key, function() {
						keyPress(key);
					});
				});

				hotkeys.add('up', 'Move the active cell up.', function() {
					if (!$scope.readonly) {
						$scope.puzzle.selectNextCell(0, -1);
					}
				});

				hotkeys.add('down', 'Move the active cell down.', function() {
					if (!$scope.readonly) {
						$scope.puzzle.selectNextCell(0, 1);
					}
				});

				hotkeys.add('left', 'Select previous level / move the active cell left.', function() {
					if ($scope.readonly) {
						$scope.prevPuzzle();
					} else {
						$scope.puzzle.selectNextCell(-1, 0);
					}
				});

				hotkeys.add('right', 'Select next level / Move the active cell right.', function() {
					if ($scope.readonly) {
						$scope.nextPuzzle();
					} else {
						$scope.puzzle.selectNextCell(1, 0);
					}
				});

				hotkeys.add('return', 'Start selected level.', function() {
					if ($scope.readonly) {
						$scope.startGame();
					}
				});
			}

			function initialize() {
				var l = GameOption.levelName();
				var r = GameOption.regionName();
				var s = GameOption.styleName();

				$scope.difficulty = l;
				$scope.displayName = s + '-' + r;

				SudokuStore.getPuzzles(s, l, GameOption.size).then(function(data) {
					puzzleData = data;
					$scope.totalPuzzles = puzzleData.length;
					if (puzzleData.length === 0) {
						$scope.emptyLevel = true;
					} else {
						$scope.puzzle = getPuzzle();
						$scope.loading = false;
						setupInputMethods();
					}
				});
			}

			initialize();
		}
	]);