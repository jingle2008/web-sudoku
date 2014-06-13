'use strict';


// Declare app level module which depends on filters, and services
angular.module('sudokuApp', ['ngRoute', 'sudokuApp.controllers'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/home', {
				templateUrl: 'partials/mainmenu.html',
				controller: 'MainMenuCtrl'
			}).when('/settings', {
				templateUrl: 'partials/settings.html',
				controller: 'SettingsCtrl'
			}).when('/rankings', {
				templateUrl: 'partials/rankings.html',
				controller: 'RankingsCtrl'
			}).when('/startnew', {
				templateUrl: 'partials/startnew.html',
				controller: 'StartNewCtrl'
			}).when('/gameplay', {
				templateUrl: 'partials/gameplay.html',
				controller: 'GamePlayCtrl'
			}).when('/about', {
				templateUrl: 'partials/about.html'
			}).otherwise({
				redirectTo: '/home'
			});
		}
	]);