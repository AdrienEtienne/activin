'use strict';

(function () {

  class MainController {

    constructor($http) {
      var that = this;
      this.$http = $http;

      $http.get('/api/applications/android/last').then(response => {
        that.android = response.data;
      });
    }
  }

  angular.module('activinApp')
    .controller('MainController', MainController);

})();
