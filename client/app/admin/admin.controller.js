'use strict';

(function () {

	class AdminController {
		constructor(User, $http, $scope, Auth, Upload) {

			$scope.application = {};
			$scope.users = User.query();
			$scope.regexVersion = /^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}(\-(alpha|beta)\.[0-9]{1,3})?$/;

			$scope.androids = [];
			$http.get('/api/applications/android').then(response => {
				$scope.androids = response.data;
			});
			$scope.ioss = [];
			$http.get('/api/applications/ios').then(response => {
				$scope.ioss = response.data;
			});

			$scope.delete = function (user) {
				user.$remove();
				$scope.users.splice(this.users.indexOf(user), 1);
			};

			$scope.deleteApplication = function (app) {
				$http.delete('/api/applications/' + app._id);
			};

			$scope.upload = function () {
				$scope.uploadSuccess = false;
				$scope.application.file.upload = Upload.upload({
					url: '/api/applications',
					data: {
						version: $scope.application.version,
						platform: $scope.application.platform,
						application: $scope.application.file
					},
				});

				$scope.application.file.upload.then(function () {
					$scope.uploadSuccess = true;
				}, function (response) {
					if (response.status > 0) {
						$scope.errorMsg = response.status + ': ' + response.data;
					}
				});
			};
		}
	}

	angular.module('activinApp.admin')
		.controller('AdminController', AdminController);

})();
