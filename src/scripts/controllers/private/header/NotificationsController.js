/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')

  .controller('NotificationsController', function ($scope, apps, companyNotifications) {
    $scope.apps = apps;
    $scope.companyNotifications = companyNotifications;

    $scope.adapter = {};
    companyNotifications.setAdapter($scope.adapter);
  })

;
