'use strict';

/* Controllers */

angular.module('sudokuApp.controllers', [])
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
		}
	]).controller('SettingsCtrl', ['$scope',
		function($scope) {
			$scope.name = "Settings";
		}
	]).controller('RankingsCtrl', ['$scope',
		function($scope) {
			$scope.name = "Leader Boards";
		}
	]).controller('GamePlayCtrl', ['$scope',
		function($scope) {
			$scope.difficulty = "Easy";
			$scope.gridStyle = "Standard";
			$scope.levelNo = 0;
			$scope.totalLevel = 100;
			$scope.timeUsed = "00:00";
			$scope.level = new LevelViewModel(level);
			$scope.readonly = true;
			$scope.options = {};
			
			$scope.control = function() {
				var size = $scope.level.regionSize;
				var commands = new CommandPanelViewModel(Math.sqrt(size));
				var letters = '123456789';

				switch (size) {
					case 16:
						letters = 'ABCDEFGHIJKLMNOP';
						break;
				}

				for (var i = 0; i < letters.length; i++) {
					commands.addCommand(letters[i], makeKeyPressCallback(letters[i]));
				}

				return commands;
			};

			this.prevLevel = function() {
				$scope.levelNo($scope.levelNo() - 1);
			};

			this.nextLevel = function() {
				$scope.levelNo($scope.levelNo() + 1);
			};

			this.start = function() {
				$scope.readonly(false);
			};

			this.keyPress = function(letter) {
				$scope.level.setCell(letter);
			};

			function makeKeyPressCallback(letter) {
				return function() {
					$scope.keyPress(letter);
				};
			}
		}
	]);