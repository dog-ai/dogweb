/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')

  .controller('AppsController', function ($scope, user, company, companyAppsRef, apps, Ref, $firebaseObject, $uibModal, lodash, $q, $timeout) {

    $scope.apps = [];

    companyAppsRef.$watch(function (event) {
      switch (event.event) {
        case 'child_changed':
          var companyApp = _retrieveCompanyApp(event.key);
          var app = lodash.find($scope.apps, {'$id': event.key});
          lodash.extend(app, companyApp);
          break;
        default:
      }
    });

    angular.forEach(companyAppsRef, function (companyApp) {
      $scope.apps.push(angular.copy(_mergeApp(companyApp)));
    });

    function _mergeApp(companyApp) {
      return lodash.merge(companyApp, lodash.find(apps, {'$id': companyApp.$id}))
    }

    $scope.toggleApp = function (app) {
      _updateCompanyApp(app.$id, {is_enabled: app.is_enabled});
    };

    function _retrieveCompanyApp(companyAppId) {
      return $firebaseObject(Ref.child('companies/' + company.$id + '/apps/' + companyAppId)).$loaded().then(function (companyApp) {
        return companyApp;
      });
    }

    function _updateCompanyApp(companyAppId, companyApp) {
      var appRef = Ref.child('companies/' + company.$id + '/apps/' + companyAppId), def = $q.defer();
      appRef.update(companyApp, function (error) {
        $timeout(function () {
          if (error) {
            def.reject(error);
          } else {
            def.resolve();
          }
        });
      });
      return def.promise;
    }
  })
;
