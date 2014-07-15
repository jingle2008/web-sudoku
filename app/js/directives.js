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
	.directive('jzCenter', function() {
		return {
			restrict: 'A',
			compile: function(element, attrs) {
				var s = parseInt(attrs.jzCenter, 10);
				var p = (element.width() % s) / 2 + 'px';
				element.css({
					'padding-left': p,
					'padding-right': p
				});
			}
		};
	})
	.directive('jzBorderWidth', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				if (!attrs.jzBorderWidth) {
					return;
				}

				var arr = attrs.jzBorderWidth.split(' ');
				element.addClass('square-border').css({
					'border-top-width': arr[0] + 'px',
					'border-right-width': arr[1] + 'px',
					'border-bottom-width': arr[2] + 'px',
					'border-left-width': arr[3] + 'px'
				});
			}
		};
	})
	.directive('jzMenuItem', function() {
		return {
			scope: {
				left: '@',
				right: '@',
				text: '@',
				desc: '@'
			},
			restrict: 'A',
			require: '^jzMenu',
			templateUrl: 'partials/jzmenuitem.html',
			transclude: true,
			compile: function(element, attrs) {
				element.addClass('list-group-item');
			}
		};
	})
	.directive('jzMenu', function() {
		return {
			scope: {
				text: '@',
				panel: '@'
			},
			restrict: 'E',
			transclude: true,
			templateUrl: 'partials/jzmenu.html',
			compile: function(element, attrs) {
				if (!attrs.panel) {
					attrs.panel = 'panel-default';
				}
			}
		};
	})
	.directive('jzFlipClock', function($parse) {
		return {
			restrict: 'E',
			template: '<div></div>',
			replace: true,
			require: 'ngModel',
			link: function(scope, element, attrs, ngModel) {
				var clock = element.FlipClock(0, {
					clockFace: 'MinuteCounter',
					autoStart: false,
					callbacks: {
						interval: function() {
							scope.$apply(function() {
								ngModel.$setViewValue(clock.getTime().time);
							});
						}
					}
				});

				ngModel.$render = function() {
					clock.setTime(ngModel.$viewValue);
				};

				scope.$watch(attrs.action, function(val) {
					if (val === 'start') {
						clock.start();
					} else if (val === 'stop') {
						clock.stop();
					}
				});
			}
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

				var btn = element.find('.dropdown-toggle');
				element.on('hidden.bs.dropdown', function() {
					btn.focus();
				});
			}
		};
	})
	.directive('jzSquare', function() {
		return {
			scope: {
				size: '@',
				border: '&',
				fixed: '=',
				selected: '=',
				highlight: '='
			},
			restrict: 'E',
			transclude: true,
			templateUrl: 'partials/jzsquare.html'
		};
	});