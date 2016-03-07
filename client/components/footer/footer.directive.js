'use strict';

angular.module('activinApp')
	.directive('footer', function () {
		return {
			templateUrl: 'components/footer/footer.html',
			restrict: 'E',
			link: function (scope, element) {
				element.addClass('footer');
			},
			controller: function ($scope, appConfig) {
				$scope.version = appConfig.version;
			}
		};
	});
