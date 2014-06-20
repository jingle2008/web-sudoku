'use strict';

/* Controllers */

angular.module('sudokuApp.controllers', ['toggle-switch', 'sudokuApp.directives', 'sudokuApp.services'])
	.controller('MainMenuCtrl', ['$scope',
		function($scope) {
			$scope.isResumable = false;
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
	.controller('GamePlayCtrl', ['$scope', 'GameOption', 'SudokuStore',
		function($scope, GameOption, SudokuStore) {
			var levelData = {
				id: 0,
				style: 0,
				difficulty: 0,
				timeUsed: 0,
				size: 9,
				mask: '011100010110010101011101110111111001001000100100111111011101110101010011010001110',
				answer: '861739425439251678527684193293168547146573982785492316918326754354817269672945831',
			};
			var puzzles = [];
			var puzzleData = [];

			$scope.puzzleId = 0;
			$scope.totalPuzzles = 'NA';
			$scope.timeUsed = '00:00';
			$scope.readonly = true;
			$scope.loading = true;

			$scope.prevLevel = function() {
				$scope.puzzleId--;
				$scope.puzzle = getPuzzle();
			};

			$scope.nextLevel = function() {
				$scope.puzzleId++;
				$scope.puzzle = getPuzzle();
			};

			$scope.canGoPrev = function() {
				return ($scope.puzzleId > 0);
			};

			$scope.canGoNext = function() {
				return ($scope.puzzleId + 1 < $scope.totalPuzzles);
			};

			$scope.start = function() {
				$scope.readonly = false;
			};

			function getPuzzle() {
				var idx = $scope.puzzleId;
				var puzzle = puzzles[idx];
				if (puzzle === undefined) {
					puzzles[idx] = puzzle = new Level(puzzleData[idx], GameOption.size);
				}
				return puzzle;
			};

			function keyPress(letter) {
				$scope.puzzle.setCell(letter);
			}

			function createKeypad(size, keys, command) {
				var keypad = new Keypad(Math.sqrt(size));
				keypad.addKeys(keys.split(''), command);
				return keypad;
			}

			function initialize() {
				var l = GameOption.levelName();
				var r = GameOption.regionName();
				var s = GameOption.styleName();

				$scope.difficulty = l;
				$scope.displayName = s + '-' + r;

				SudokuStore.loadPuzzles(s, l, GameOption.size, function(data) {
					puzzleData = data;
					$scope.totalPuzzles = puzzleData.length;
					$scope.puzzle = getPuzzle();
					$scope.loading = false;
				});

				$scope.keypad = createKeypad(GameOption.size, '123456789', keyPress);
			}

			initialize();
		}
	]);