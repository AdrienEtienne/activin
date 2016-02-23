'use strict';

angular.module('activinApp.auth', [
  'activinApp.constants',
  'activinApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
