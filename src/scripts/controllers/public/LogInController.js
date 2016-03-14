/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';
/**
 * @ngdoc function
 * @name dogweb.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
angular.module('dogweb')
  .controller('LogInController', function ($scope, Auth, $location) {

    $scope.authenticate = function (email, password) {
      if ($scope.form.$invalid) {
        return;
      }

      Auth.$authWithPassword({email: email, password: password}, {rememberMe: true}).then(redirect, error);
    };

    function redirect() {
      $location.path('/dashboard');
    }

    function error(error) {
      $scope.error = error;
    }
  });
