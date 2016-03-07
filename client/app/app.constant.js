(function(angular, undefined) {
'use strict';

angular.module('activinApp.constants', [])

.constant('appConfig', {userRoles:['guest','user','admin'],data:{sports:['running','cycling','soccer']},version:'1.0.0-alpha.3'})

;
})(angular);