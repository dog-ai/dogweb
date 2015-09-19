/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogwebApp')
  .controller('NavigationController', function ($scope, user, company, Auth) {
    $scope.user = user;
    $scope.company = company;

    $scope.signout = function () {
      Auth.$unauth();
    };
  });
