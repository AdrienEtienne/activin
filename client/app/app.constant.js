(function(angular, undefined) {
'use strict';

angular.module('activinApp.constants', [])

.constant('appConfig', {userRoles:['guest','user','admin'],data:{sports:['running','cycling','soccer']}})

;
})(angular);