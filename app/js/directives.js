'use strict';

/* Directives */


angular.module('sudokuApp.directives', [])
	.directive('backButton', ['$window',
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
	]);