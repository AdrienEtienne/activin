'use strict';

(function () {

	class AdminController {
		constructor(User, $http) {
			this.http = $http;

			// Use the User $resource to fetch all users
			this.users = User.query();
			this.regexVersion = /^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}(\-(alpha|beta)\.[0-9]{1,3})?$/;
		}

		delete(user) {
			user.$remove();
			this.users.splice(this.users.indexOf(user), 1);
		}

		uploadApplication(form) {
			var fd = new FormData();
			//Take the first selected file
			fd.append('file', form.file);

			this.http.post('/api/applications', fd, {
				withCredentials: true,
				headers: {
					'Content-Type': undefined
				},
				transformRequest: angular.identity
			}).success(console.log('ok')).error(console.log('nok'));
		}
	}

	angular.module('activinApp.admin')
		.controller('AdminController', AdminController);

})();
