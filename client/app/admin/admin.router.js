'use strict';

angular.module('activinApp.admin')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminController',
        authenticate: 'admin'
      });
  });
