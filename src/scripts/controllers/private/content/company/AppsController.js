/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')

  .controller('AppsController', function ($scope, apps, companyApps) {
    $scope.apps = apps;
    $scope.companyApps = companyApps;

    $scope.adapter = {};
    companyApps.setAdapter($scope.adapter);
  })
;
