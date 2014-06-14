'use strict';

/* Controllers */

angular.module('sudokuApp.controllers', ['toggle-switch', 'sudokuApp.directives'])
	.controller('MainMenuCtrl', ['$scope',
		function($scope) {
			$scope.isResumable = false;
		}
	])
	.controller('StartNewCtrl', ['$scope',
		function($scope) {
			$scope.numSolved = 100;
			$scope.averageTime = 100;
			$scope.fastestTime = 100;

			var config = $scope.config = {
				style: 0,
				styleList: ['Standard', 'Squiggly'],
				region: 0,
				regionList: [
					'No extra regions',
					'X-Sudoku',
					'Hyper-Sudoku',
					'Percent-Sudoku',
					'Color-Sudoku'
				],
				difficulty: 0,
				difficultyList: [
					'Easy',
					'Medium',
					'Challenging',
					'Hard',
					'Fiendish'
				]
			};

			$scope.selectStyle = function(r) {
				config.style = config.styleList.indexOf(r);
			};

			$scope.selectRegion = function(o) {
				config.region = config.regionList.indexOf(o);
			};

			$scope.selectDifficulty = function(o) {
				config.difficulty = config.difficultyList.indexOf(o);
			};
		}
	]).controller('SettingsCtrl', ['$scope',
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
	]).controller('RankingsCtrl', ['$scope',
		function($scope) {
			$scope.name = 'Leader Boards';
		}
	]).controller('GamePlayCtrl', ['$scope',
		function($scope) {
			$scope.difficulty = 'Easy';
			$scope.gridStyle = 'Standard';
			$scope.levelNo = 0;
			$scope.totalLevel = 100;
			$scope.timeUsed = '00:00';
			$scope.level = new LevelViewModel(level);
			$scope.readonly = true;
			$scope.options = {};

			$scope.keyPress = function(letter) {
				$scope.level.setCell(letter);
			};

			$scope.makeKeyPressCallback = function(letter) {
				return function() {
					$scope.keyPress(letter);
				};
			};

			var size = $scope.level.regionSize;
			var commands = new CommandPanelViewModel(Math.sqrt(size));
			var letters = '123456789';

			switch (size) {
				case 16:
					letters = 'ABCDEFGHIJKLMNOP';
					break;
			}

			for (var i = 0; i < letters.length; i++) {
				commands.addCommand(letters[i], $scope.makeKeyPressCallback(letters[i]));
				//commands.addCommand(letters[i], function(){console.log('x');});
			}

			$scope.control = commands;
			// $scope.control = function() {
			// 	var size = $scope.level.regionSize;
			// 	var commands = new CommandPanelViewModel(Math.sqrt(size));
			// 	var letters = '123456789';

			// 	switch (size) {
			// 		case 16:
			// 			letters = 'ABCDEFGHIJKLMNOP';
			// 			break;
			// 	}

			// 	for (var i = 0; i < letters.length; i++) {
			// 		//commands.addCommand(letters[i], $scope.makeKeyPressCallback(letters[i]));
			// 		commands.addCommand(letters[i]);
			// 	}

			// 	return commands;
			// };

			$scope.prevLevel = function() {
				$scope.levelNo--;
			};

			$scope.nextLevel = function() {
				$scope.levelNo++;
			};

			$scope.start = function() {
				$scope.readonly = false;
			};



			// function makeKeyPressCallback(letter) {
			// 	return function() {
			// 		//$scope.keyPress(letter);
			// 	};
			// }
		}
	]);