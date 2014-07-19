'use strict';

/* Controllers */

angular.module('sudokuApp.controllers', ['toggle-switch', 'sudokuApp.directives', 'sudokuApp.services', 'cfp.hotkeys'])
	.controller('MainMenuCtrl', ['$scope',
		function($scope) {
			$scope.isResumable = false;
		}
	])
	.controller('LoginCtrl', ['$scope', 'UserService',
		function($scope, UserService) {
			$scope.auth = UserService.auth;
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
					UserService.setUserId(user.id);
				}, function(error) {
					$scope.busy = false;
					$scope.message = error.message;
				});
			};

			$scope.signOut = function() {
				$scope.auth.$logout();
				UserService.setUserId(null);
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
	.controller('GamePlayCtrl', ['$scope', 'hotkeys', 'GameOption', 'SudokuStore', 'UserService',
		function($scope, hotkeys, GameOption, SudokuStore, UserService) {
			var puzzleData = [];

			$scope.puzzleId = 0;
			$scope.timerAction = '';
			$scope.readonly = true;
			$scope.solved = false;
			$scope.loading = true;
			$scope.emptyLevel = false;

			$scope.totalPuzzles = function() {
				return puzzleData.length;
			};

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
				return ($scope.puzzleId + 1 < $scope.totalPuzzles());
			};

			$scope.startGame = function() {
				$scope.readonly = false;
				$scope.timerAction = 'start';
			};

			$scope.resetGame = function() {
				$scope.puzzle.reset();
				if (UserService.auth.user) {
					SudokuStore.resetGame($scope.puzzle.id, UserService.getUserId());
				}
				$scope.startGame();
			};

			$scope.nextGame = function() {
				$scope.readonly = true;
				$scope.solved = false;
				$scope.nextPuzzle();
			};

			$scope.$on('$locationChangeStart', function(event, next, current) {
				if ($scope.readonly || $scope.puzzle.completed || !UserService.auth.user) {
					return;
				}

				SudokuStore.saveGame($scope.puzzle.id, UserService.getUserId(),
					$scope.puzzle.timeUsed, $scope.puzzle.getCellValues().join(''));
			});

			function getPuzzle() {
				var idx = $scope.puzzleId;
				var puzzle = puzzleData[idx].puzzleObj;
				if (puzzle === undefined) {
					puzzleData[idx].puzzleObj = puzzle = new Puzzle(puzzleData[idx], GameOption.size);
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

					if (UserService.auth.user) {
						SudokuStore.saveScore($scope.puzzle.id, UserService.getUserId(), $scope.puzzle.timeUsed);
					}
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
				var bindedHotkeys = hotkeys.bindTo($scope);
				keys.forEach(function(key) {
					bindedHotkeys.add(key, function() {
						keyPress(key);
					});
				});

				bindedHotkeys.add('up', 'Move the active cell up.', function() {
					if (!$scope.readonly) {
						$scope.puzzle.selectNextCell(0, -1);
					}
				}).add('down', 'Move the active cell down.', function() {
					if (!$scope.readonly) {
						$scope.puzzle.selectNextCell(0, 1);
					}
				}).add('left', 'Select previous level / move the active cell left.', function() {
					if ($scope.readonly) {
						$scope.prevPuzzle();
					} else {
						$scope.puzzle.selectNextCell(-1, 0);
					}
				}).add('right', 'Select next level / Move the active cell right.', function() {
					if ($scope.readonly) {
						$scope.nextPuzzle();
					} else {
						$scope.puzzle.selectNextCell(1, 0);
					}
				}).add('return', 'Start selected level.', function() {
					if ($scope.readonly) {
						$scope.startGame();
					}
				});
			}

			function getUnfinished() {
				for (var i = 0; i < puzzleData.length; i++) {
					var puzzleObj = puzzleData[i].puzzleObj;
					if (puzzleObj && puzzleObj.completed) {
						continue;
					}

					var result = puzzleData[i].result;
					if (!result || result.status === 0) {
						return i;
					}
				}

				return -1;
			}

			function initialize() {
				var l = GameOption.levelName();
				var r = GameOption.regionName();
				var s = GameOption.styleName();

				$scope.difficulty = l;
				$scope.displayName = s + '-' + r;

				SudokuStore.getPuzzles(s, l, GameOption.size, UserService.getUserId()).then(function(data) {
					puzzleData = data;
					if (puzzleData.length === 0) {
						$scope.emptyLevel = true;
					} else {
						$scope.puzzleId = getUnfinished();
						$scope.puzzle = getPuzzle();
						$scope.loading = false;
						setupInputMethods();
					}
				});
			}

			initialize();
		}
	]);