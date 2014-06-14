'use strict';

/* Directives */


angular.module('sudokuApp.directives', [])
	.directive('jzBackButton', ['$window',
		function($window) {
			return {
				restrict: 'A',
				link: function(scope, element, attrs) {
					element.bind('click', function() {
						$window.history.back();
					});
				}
			};
		}
	])
	.directive('jzListItem', function() {
		return {
			scope: {
				left: '@',
				right: '@',
				header: '@',
				description: '@'
			},
			restrict: 'E',
			templateUrl: 'partials/jzlistitem.html',
			transclude: true
		};
	})
	.directive('jzSelect', function() {
		return {
			scope: {
				model: '=',
				options: '=',
				select: '&',
				button: '@'
			},
			restrict: 'E',
			templateUrl: 'partials/jzselect.html',
			compile: function(element, attrs) {
				if (!attrs.button) {
					attrs.button = 'btn-default';
				}
			}
		};
	});