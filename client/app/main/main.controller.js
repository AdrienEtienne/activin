'use strict';

(function () {

  class MainController {

    constructor($http, $scope) {
      this.$http = $http;
      this.sports = [];

      $http.get('/api/sports').then(response => {
        this.sports = response.data;
      });
    }
  }

  angular.module('activinApp')
    .controller('MainController', MainController);

})();
